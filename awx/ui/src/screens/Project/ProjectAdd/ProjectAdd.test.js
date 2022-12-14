import React from 'react';
import { act } from 'react-dom/test-utils';
import { createMemoryHistory } from 'history';
import { ProjectsAPI, CredentialTypesAPI } from 'api';
import {
  mountWithContexts,
  waitForElement,
} from '../../../../testUtils/enzymeHelpers';
import ProjectAdd from './ProjectAdd';

jest.mock('../../../api');

describe('<ProjectAdd />', () => {
  let wrapper;
  const projectData = {
    name: 'foo',
    description: 'bar',
    scm_type: 'git',
    scm_url: 'https://foo.bar',
    scm_clean: true,
    scm_track_submodules: false,
    credential: 100,
    signature_validation_credential: 200,
    local_path: '',
    organization: { id: 2, name: 'Bar' },
    scm_update_on_launch: true,
    scm_update_cache_timeout: 3,
    allow_override: false,
    custom_virtualenv: '/var/lib/awx/venv/custom-env',
    default_environment: { id: 1, name: 'Foo' },
  };

  const projectOptionsResolve = {
    data: {
      actions: {
        GET: {
          scm_type: {
            choices: [
              ['', 'Manual'],
              ['git', 'Git'],
              ['svn', 'Subversion'],
              ['archive', 'Remote Archive'],
              ['insights', 'Red Hat Insights'],
            ],
          },
        },
      },
    },
  };

  const scmCredentialResolve = {
    data: {
      results: [
        {
          id: 4,
          name: 'Source Control',
          kind: 'scm',
        },
      ],
      count: 1,
    },
  };

  const insightsCredentialResolve = {
    data: {
      results: [
        {
          id: 5,
          name: 'Insights',
          kind: 'insights',
        },
      ],
      count: 1,
    },
  };

  const cryptographyCredentialResolve = {
    data: {
      results: [
        {
          id: 6,
          name: 'GPG Public Key',
          kind: 'cryptography',
        },
      ],
      count: 1,
    },
  };

  beforeEach(async () => {
    await ProjectsAPI.readOptions.mockImplementation(
      () => projectOptionsResolve
    );
    await CredentialTypesAPI.read.mockImplementation(
      () => scmCredentialResolve
    );
    await CredentialTypesAPI.read.mockImplementation(
      () => insightsCredentialResolve
    );
    await CredentialTypesAPI.read.mockImplementation(
      () => cryptographyCredentialResolve
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initially renders successfully', async () => {
    await act(async () => {
      wrapper = mountWithContexts(<ProjectAdd />);
    });
    expect(wrapper.length).toBe(1);
  });

  test('handleSubmit should post to the api', async () => {
    ProjectsAPI.create.mockResolvedValueOnce({
      data: { ...projectData },
    });
    await act(async () => {
      wrapper = mountWithContexts(<ProjectAdd />);
    });
    await waitForElement(wrapper, 'ContentLoading', (el) => el.length === 0);
    wrapper.find('ProjectForm').invoke('handleSubmit')(projectData);
    expect(ProjectsAPI.create).toHaveBeenCalledTimes(1);
    expect(ProjectsAPI.create).toHaveBeenCalledWith({
      ...projectData,
      organization: 2,
      default_environment: 1,
      signature_validation_credential: 200,
    });
  });

  test('handleSubmit should throw an error', async () => {
    const config = {
      project_local_paths: ['foobar', 'qux'],
      project_base_dir: 'dir/foo/bar',
    };
    const error = {
      response: {
        config: {
          method: 'create',
          url: '/api/v2/projects/',
        },
        data: { detail: 'An error occurred' },
      },
    };
    ProjectsAPI.create.mockRejectedValue(error);
    await act(async () => {
      wrapper = mountWithContexts(<ProjectAdd />, {
        context: { config },
      });
    });
    await waitForElement(wrapper, 'ContentLoading', (el) => el.length === 0);
    await act(async () => {
      wrapper.find('ProjectForm').prop('handleSubmit')(
        { ...projectData },
        { scm_type: 'manual' }
      );
    });
    wrapper.update();
    expect(ProjectsAPI.create).toHaveBeenCalledTimes(1);
    expect(wrapper.find('ProjectForm').prop('submitError')).toEqual(error);
  });

  test('CardBody cancel button should navigate to projects list', async () => {
    const history = createMemoryHistory();
    await act(async () => {
      wrapper = mountWithContexts(<ProjectAdd />, {
        context: { router: { history } },
      });
    });
    await waitForElement(wrapper, 'EmptyStateBody', (el) => el.length === 0);
    await act(async () => {
      wrapper.find('ProjectAdd button[aria-label="Cancel"]').simulate('click');
    });
    expect(history.location.pathname).toEqual('/projects');
  });
});
