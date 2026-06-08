import {
  selectAIProvider,
  isSupportedProvider,
  SUPPORTED_PROVIDERS,
  getProviderSwitchLogs,
  clearProviderSwitchLogs,
} from '../lib/ai-provider-router';

describe('AI Provider Router', () => {
  beforeEach(() => {
    clearProviderSwitchLogs();
  });

  test('should validate supported providers', () => {
    expect(isSupportedProvider('huggingface')).toBe(true);
    expect(isSupportedProvider('nvidia')).toBe(true);
    expect(isSupportedProvider('kimi')).toBe(true);
    expect(isSupportedProvider('invalid')).toBe(false);
  });

  test('should select provider based on enterprise tier', () => {
    const provider = selectAIProvider({ tierLevel: 'enterprise' });
    expect(provider).toBe('nvidia');
  });

  test('should select provider based on growth tier', () => {
    const provider = selectAIProvider({ tierLevel: 'growth' });
    expect(provider).toBe('kimi');
  });

  test('should select provider based on starter tier', () => {
    const provider = selectAIProvider({ tierLevel: 'starter' });
    expect(provider).toBe('huggingface');
  });

  test('should select provider based on Asia region', () => {
    const provider = selectAIProvider({ userRegion: 'Asia-Pacific' });
    expect(provider).toBe('kimi');
  });

  test('should select provider based on North America region', () => {
    const provider = selectAIProvider({ userRegion: 'North America' });
    expect(provider).toBe('nvidia');
  });

  test('should select provider based on analysis request type', () => {
    const provider = selectAIProvider({ requestType: 'analysis' });
    expect(provider).toBe('kimi');
  });

  test('should prioritize higher-priority rules', () => {
    // Enterprise tier should override region
    const provider = selectAIProvider({
      tierLevel: 'enterprise',
      userRegion: 'Asia-Pacific',
    });
    expect(provider).toBe('nvidia');
  });

  test('should use default provider when no rules match', () => {
    const provider = selectAIProvider({ userRegion: 'Europe' });
    expect(provider).toBe('huggingface');
  });

  test('should log provider selection events', () => {
    selectAIProvider({ tierLevel: 'growth' });
    const logs = getProviderSwitchLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].selectedProvider).toBe('kimi');
    expect(logs[0].attributes.tierLevel).toBe('growth');
  });
});
