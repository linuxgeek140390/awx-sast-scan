import React from 'react';
import { act } from 'react-dom/test-utils';
import { JobTemplatesAPI, WorkflowJobTemplateNodesAPI, RootAPI } from 'api';
import {
  mountWithContexts,
  waitForElement,
} from '../../../../testUtils/enzymeHelpers';
import JobTemplateDetail from './JobTemplateDetail';
import mockTemplate from '../shared/data.job_template.json';

jest.mock('../../../api');

const mockInstanceGroups = {
  count: 5,
  data: {
    results: [
      { id: 1, name: 'IG1' },
      { id: 2, name: 'IG2' },
    ],
  },
};

describe('<JobTemplateDetail />', () => {
  let wrapper;

  beforeEach(async () => {
    JobTemplatesAPI.readInstanceGroups.mockResolvedValue(mockInstanceGroups);
    WorkflowJobTemplateNodesAPI.read.mockResolvedValue({ data: { count: 0 } });
    RootAPI.readAssetVariables.mockResolvedValue({
      data: {
        BRAND_NAME: 'AWX',
      },
    });
    await act(async () => {
      wrapper = mountWithContexts(
        <JobTemplateDetail template={mockTemplate} />
      );
    });
    await waitForElement(wrapper, 'ContentLoading', (el) => el.length === 0);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render successfully with missing summary fields', async () => {
    await act(async () => {
      wrapper = mountWithContexts(
        <JobTemplateDetail
          template={{
            ...mockTemplate,
            become_enabled: true,
            summary_fields: { user_capabilities: {} },
          }}
        />
      );
    });
    await waitForElement(wrapper, 'ContentLoading', (el) => el.length === 0);
    await waitForElement(
      wrapper,
      'Detail[label="Name"]',
      (el) => el.length === 1
    );
  });

  test('should have proper number of delete detail requests', async () => {
    await act(async () => {
      wrapper = mountWithContexts(
        <JobTemplateDetail
          template={{
            ...mockTemplate,
            become_enabled: true,
            summary_fields: { user_capabilities: { delete: true } },
          }}
        />
      );
    });
    expect(
      wrapper.find('DeleteButton').prop('deleteDetailsRequests')
    ).toHaveLength(1);
  });

  test('should request instance groups from api', async () => {
    expect(JobTemplatesAPI.readInstanceGroups).toHaveBeenCalledTimes(1);
  });

  test('should hide edit button for users without edit permission', async () => {
    await act(async () => {
      wrapper = mountWithContexts(
        <JobTemplateDetail
          template={{
            ...mockTemplate,
            diff_mode: true,
            host_config_key: 'key',
            summary_fields: { user_capabilities: { edit: false } },
          }}
        />
      );
    });
    expect(wrapper.find('button[aria-label="Edit"]').length).toBe(0);
  });

  test('should render credential chips', () => {
    const chips = wrapper.find('CredentialChip');
    expect(chips).toHaveLength(2);
    chips.forEach((chip, id) => {
      expect(chip.prop('credential')).toEqual(
        mockTemplate.summary_fields.credentials[id]
      );
    });
  });

  test('should render Source Control Branch', async () => {
    const SCMBranch = wrapper.find('Detail[label="Source Control Branch"]');
    expect(SCMBranch.prop('value')).toBe('Foo branch');
  });

  test('should render instance groups link', async () => {
    const instanceGroups = wrapper.find('Detail[label="Instance Groups"]');
    expect(
      instanceGroups.find('Link[to="/instance_groups/2/details"]')
    ).toHaveLength(1);
  });

  test('should show content error for failed instance group fetch', async () => {
    JobTemplatesAPI.readInstanceGroups.mockImplementationOnce(() =>
      Promise.reject(new Error())
    );
    await act(async () => {
      wrapper = mountWithContexts(
        <JobTemplateDetail
          template={{
            ...mockTemplate,
            allow_simultaneous: true,
            ask_inventory_on_launch: true,
            summary_fields: {
              inventory: {
                kind: 'smart',
              },
            },
          }}
        />
      );
    });
    await waitForElement(wrapper, 'ContentError', (el) => el.length === 1);
  });

  test('expected api calls are made for delete', async () => {
    await act(async () => {
      wrapper.find('DeleteButton').invoke('onConfirm')();
    });
    expect(JobTemplatesAPI.destroy).toHaveBeenCalledTimes(1);
  });

  test('Error dialog shown for failed deletion', async () => {
    JobTemplatesAPI.destroy.mockImplementationOnce(() =>
      Promise.reject(new Error())
    );
    await act(async () => {
      wrapper.find('DeleteButton').invoke('onConfirm')();
    });
    await waitForElement(
      wrapper,
      'Modal[title="Error!"]',
      (el) => el.length === 1
    );
    await act(async () => {
      wrapper.find('Modal[title="Error!"]').invoke('onClose')();
    });
    await waitForElement(
      wrapper,
      'Modal[title="Error!"]',
      (el) => el.length === 0
    );
  });

  test('webhook fields should render properly', () => {
    expect(wrapper.find('Detail[label="Webhook Service"]').length).toBe(1);
    expect(wrapper.find('Detail[label="Webhook Service"]').prop('value')).toBe(
      'GitHub'
    );
    expect(wrapper.find('Detail[label="Webhook URL"]').length).toBe(1);
    expect(wrapper.find('Detail[label="Webhook URL"]').prop('value')).toContain(
      'api/v2/job_templates/7/github/'
    );
    expect(wrapper.find('Detail[label="Webhook Key"]').length).toBe(1);
    expect(wrapper.find('Detail[label="Webhook Credential"]').length).toBe(1);
  });

  test('execution environment field should render properly', () => {
    expect(wrapper.find('Detail[label="Execution Environment"]').length).toBe(
      1
    );
    expect(
      wrapper.find(`Detail[label="Execution Environment"] dd`).text()
    ).toBe('Default EE');
  });

  test('should not load credentials', async () => {
    await act(async () => {
      wrapper = mountWithContexts(
        <JobTemplateDetail
          template={{
            ...mockTemplate,
            allow_simultaneous: true,
            ask_inventory_on_launch: true,
            summary_fields: {
              credentials: [],
            },
          }}
        />
      );
    });
    const credentials_detail = wrapper
      .find(`Detail[label="Credentials"]`)
      .at(0);
    expect(credentials_detail.prop('isEmpty')).toEqual(true);
  });

  test('should not load labels', async () => {
    await act(async () => {
      wrapper = mountWithContexts(
        <JobTemplateDetail
          template={{
            ...mockTemplate,
            allow_simultaneous: true,
            ask_inventory_on_launch: true,
            summary_fields: {
              labels: {
                results: [],
              },
            },
          }}
        />
      );
    });
    const labels_detail = wrapper.find(`Detail[label="Labels"]`).at(0);
    expect(labels_detail.prop('isEmpty')).toEqual(true);
  });

  test('should not load instance groups', async () => {
    JobTemplatesAPI.readInstanceGroups.mockResolvedValue({
      data: {
        results: [],
      },
    });

    let wrapper;
    await act(async () => {
      wrapper = mountWithContexts(
        <JobTemplateDetail template={mockTemplate} />
      );
    });
    wrapper.update();
    const instance_groups_detail = wrapper
      .find(`Detail[label="Instance Groups"]`)
      .at(0);
    expect(instance_groups_detail.prop('isEmpty')).toEqual(true);
  });

  test('should not load job tags', async () => {
    await act(async () => {
      wrapper = mountWithContexts(
        <JobTemplateDetail
          template={{
            ...mockTemplate,
            job_tags: '',
          }}
        />
      );
    });
    expect(wrapper.find('Detail[label="Job Tags"]').length).toBe(0);
  });

  test('should not load skip tags', async () => {
    await act(async () => {
      wrapper = mountWithContexts(
        <JobTemplateDetail
          template={{
            ...mockTemplate,
            skip_tags: '',
          }}
        />
      );
    });
    expect(wrapper.find('Detail[label="Skip Tags"]').length).toBe(0);
  });
});
