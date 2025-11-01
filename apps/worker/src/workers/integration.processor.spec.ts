import { IntegrationProcessor } from './integration.processor';
import { JiraIntegrationProvider } from '../integrations/jira.provider';
import { ServiceNowIntegrationProvider } from '../integrations/servicenow.provider';

describe('IntegrationProcessor', () => {
  let jiraProvider: JiraIntegrationProvider;
  let serviceNowProvider: ServiceNowIntegrationProvider;
  let processor: IntegrationProcessor;

  beforeEach(() => {
    jiraProvider = new JiraIntegrationProvider();
    serviceNowProvider = new ServiceNowIntegrationProvider();

    // Speed up tests by bypassing artificial latency
    (jiraProvider as any).simulateLatency = jest.fn().mockResolvedValue(undefined);
    (serviceNowProvider as any).simulateLatency = jest.fn().mockResolvedValue(undefined);

    processor = new IntegrationProcessor(jiraProvider, serviceNowProvider);
  });

  it('routes Jira create jobs to the Jira provider', async () => {
    const spy = jest.spyOn(jiraProvider, 'create').mockResolvedValue({
      success: true,
      message: 'created'
    });

    await processor.handle({
      provider: 'jira',
      action: 'create',
      payload: { summary: 'Map FedRAMP control' }
    });

    expect(spy).toHaveBeenCalledWith({ summary: 'Map FedRAMP control' });
  });

  it('routes ServiceNow sync jobs to the ServiceNow provider', async () => {
    const spy = jest.spyOn(serviceNowProvider, 'sync').mockResolvedValue({
      success: true,
      message: 'synced'
    });

    const result = await processor.handle({
      provider: 'servicenow',
      action: 'sync',
      payload: { assignmentGroup: 'SN-SECOPS' },
      attempt: 2
    });

    expect(spy).toHaveBeenCalledWith({ assignmentGroup: 'SN-SECOPS' });
    expect(result.success).toBeTruthy();
  });

  it('throws when provider is unsupported', async () => {
    await expect(
      // @ts-expect-error – intentional invalid provider to exercise guard
      processor.handle({ provider: 'asana', action: 'create', payload: {} })
    ).rejects.toThrow(/Unsupported integration provider/);
  });
});
