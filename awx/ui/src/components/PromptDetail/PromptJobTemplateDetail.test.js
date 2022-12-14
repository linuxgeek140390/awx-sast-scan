import React from 'react';
import { mountWithContexts } from '../../../testUtils/enzymeHelpers';
import PromptJobTemplateDetail from './PromptJobTemplateDetail';
import mockData from './data.job_template.json';

const mockJT = {
  ...mockData,
  webhook_key: 'PiM3n2',
  instance_groups: [
    {
      id: 1,
      name: 'ig1',
    },
    {
      id: 2,
      name: 'ig2',
    },
  ],
};

function assertDetail(wrapper, label, value) {
  expect(wrapper.find(`Detail[label="${label}"] dt`).text()).toBe(label);
  expect(wrapper.find(`Detail[label="${label}"] dd`).text()).toBe(value);
}

describe('PromptJobTemplateDetail', () => {
  let wrapper;

  beforeAll(() => {
    wrapper = mountWithContexts(<PromptJobTemplateDetail resource={mockJT} />);
  });

  test('should render successfully', () => {
    expect(wrapper.find('PromptJobTemplateDetail')).toHaveLength(1);
  });

  test('should render expected details', () => {
    assertDetail(wrapper, 'Job Type', 'Run');
    assertDetail(wrapper, 'Inventory', 'Demo Inventory');
    const link = wrapper.find('Detail[label="Inventory"]');
    expect(link.find('Link').prop('to')).toBe(
      '/inventories/inventory/1/details'
    );
    assertDetail(wrapper, 'Project', 'Mock Project');
    assertDetail(wrapper, 'Source Control Branch', 'Foo branch');
    assertDetail(wrapper, 'Playbook', 'ping.yml');
    assertDetail(wrapper, 'Forks', '2');
    assertDetail(wrapper, 'Limit', 'alpha:beta');
    assertDetail(wrapper, 'Verbosity', '3 (Debug)');
    assertDetail(wrapper, 'Show Changes', 'Off');
    assertDetail(wrapper, 'Job Slicing', '1');
    assertDetail(wrapper, 'Host Config Key', 'a1b2c3');
    assertDetail(wrapper, 'Webhook Service', 'Github');
    assertDetail(wrapper, 'Webhook Key', 'PiM3n2');
    expect(wrapper.find('StatusIcon')).toHaveLength(2);
    expect(wrapper.find('Detail[label="Webhook URL"] dd').text()).toEqual(
      expect.stringContaining('/api/v2/job_templates/7/github/')
    );
    expect(
      wrapper.find('Detail[label="Provisioning Callback URL"] dd').text()
    ).toEqual(expect.stringContaining('/api/v2/job_templates/7/callback/'));
    expect(
      wrapper
        .find('Detail[label="Webhook Credential"]')
        .containsAllMatchingElements([
          <span>
            <strong>Github Token:</strong>GitHub Cred
          </span>,
        ])
    ).toEqual(true);
    expect(
      wrapper.find('Detail[label="Credentials"]').containsAllMatchingElements([
        <span>
          <strong>SSH:</strong>Credential 1
        </span>,
        <span>
          <strong>Awx:</strong>Credential 2
        </span>,
      ])
    ).toEqual(true);
    expect(
      wrapper
        .find('Detail[label="Labels"]')
        .containsAllMatchingElements([<span>L_91o2</span>, <span>L_91o3</span>])
    ).toEqual(true);
    expect(
      wrapper
        .find('Detail[label="Instance Groups"]')
        .containsAllMatchingElements([<span>ig1</span>, <span>ig2</span>])
    ).toEqual(true);
    expect(
      wrapper
        .find('Detail[label="Job Tags"]')
        .containsAllMatchingElements([<span>T_100</span>, <span>T_200</span>])
    ).toEqual(true);
    expect(
      wrapper
        .find('Detail[label="Skip Tags"]')
        .containsAllMatchingElements([<span>S_100</span>, <span>S_200</span>])
    ).toEqual(true);
    expect(
      wrapper
        .find('Detail[label="Enabled Options"]')
        .containsAllMatchingElements([
          <li>Privilege Escalation</li>,
          <li>Provisioning Callbacks</li>,
          <li>Concurrent Jobs</li>,
          <li>Fact Storage</li>,
          <li>Webhooks</li>,
        ])
    ).toEqual(true);
    expect(wrapper.find('VariablesDetail').prop('value')).toEqual(
      '---foo: bar'
    );
  });

  test('should render "Deleted" details', () => {
    delete mockJT.summary_fields.inventory;
    delete mockJT.summary_fields.organization;
    delete mockJT.summary_fields.project;

    wrapper = mountWithContexts(<PromptJobTemplateDetail resource={mockJT} />);

    assertDetail(wrapper, 'Inventory', 'Deleted');
    assertDetail(wrapper, 'Organization', 'Deleted');
    assertDetail(wrapper, 'Project', 'Deleted');
  });

  test('should not load Activity', () => {
    wrapper = mountWithContexts(
      <PromptJobTemplateDetail
        resource={{
          ...mockJT,
          summary_fields: {
            recent_jobs: [],
          },
        }}
      />
    );
    const activity_detail = wrapper.find(`Detail[label="Activity"]`).at(0);
    expect(activity_detail.prop('isEmpty')).toEqual(true);
  });

  test('should not load Credentials', () => {
    wrapper = mountWithContexts(
      <PromptJobTemplateDetail
        resource={{
          ...mockJT,
          summary_fields: {
            credentials: [],
          },
        }}
      />
    );
    const credentials_detail = wrapper
      .find(`Detail[label="Credentials"]`)
      .at(0);
    expect(credentials_detail.prop('isEmpty')).toEqual(true);
  });

  test('should not load Labels', () => {
    wrapper = mountWithContexts(
      <PromptJobTemplateDetail
        resource={{
          ...mockJT,
          summary_fields: {
            labels: {
              results: [],
            },
          },
        }}
      />
    );
    const labels_detail = wrapper.find(`Detail[label="Labels"]`).at(0);
    expect(labels_detail.prop('isEmpty')).toEqual(true);
  });

  test('should not load Instance Groups', () => {
    wrapper = mountWithContexts(
      <PromptJobTemplateDetail
        resource={{
          ...mockJT,
          instance_groups: [],
        }}
      />
    );
    const instance_groups_detail = wrapper
      .find(`Detail[label="Instance Groups"]`)
      .at(0);
    expect(instance_groups_detail.prop('isEmpty')).toEqual(true);
  });

  test('should not load Job Tags', () => {
    wrapper = mountWithContexts(
      <PromptJobTemplateDetail
        resource={{
          ...mockJT,
          job_tags: '',
        }}
      />
    );
    expect(wrapper.find('Detail[label="Job Tags"]').length).toBe(0);
  });

  test('should not load Skip Tags', () => {
    wrapper = mountWithContexts(
      <PromptJobTemplateDetail
        resource={{
          ...mockJT,
          skip_tags: '',
        }}
      />
    );
    expect(wrapper.find('Detail[label="Skip Tags"]').length).toBe(0);
  });
});
