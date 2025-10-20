const BASE_URL = process.env.TEST_URL || 'http://127.0.0.1:3000';

class AuthTester {
  constructor() {
    this.EXISTING_USER = {
      email: 'testuser@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    this.NON_EXISTENT_EMAIL = 'nonexistent-user@example.com';
  }

  async setup() {
    // Ensure the user exists
    await this.makeRequest('POST', '/api/auth/register', this.EXISTING_USER);
  }

  async testForgotPasswordEnumeration() {
    console.log('🧪 Test: User enumeration in forgot password...');

    // Request with non-existent email
    const resNonExistent = await this.makeRequest('POST', '/api/auth/forgot-password', { email: this.NON_EXISTENT_EMAIL });

    // Request with existing email
    const resExistent = await this.makeRequest('POST', '/api/auth/forgot-password', { email: this.EXISTING_USER.email });

    if (resNonExistent.status !== 200 || resExistent.status !== 200) {
      throw new Error(`Expected status 200 for both requests, but got ${resNonExistent.status} and ${resExistent.status}`);
    }

    if (resNonExistent.data.message !== resExistent.data.message) {
      throw new Error(`Response messages do not match, indicating user enumeration vulnerability. Got: "${resNonExistent.data.message}" and "${resExistent.data.message}"`);
    }

    console.log('✅ Forgot password responses are identical. No enumeration vulnerability found.');
  }

  async makeRequest(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    const result = await response.json().catch(() => ({}));

    return {
      status: response.status,
      ok: response.ok,
      data: result
    };
  }

  async runAllTests() {
    console.log('🚀 Starting auth tests...');
    await this.setup();
    const results = {
      success: [],
      failures: []
    };

    const tests = [
      { name: 'Forgot Password Enumeration', fn: () => this.testForgotPasswordEnumeration() },
    ];

    for (const test of tests) {
      try {
        await test.fn();
        results.success.push(test.name);
      } catch (error) {
        console.error(`❌ ${test.name}: ${error.message}`);
        results.failures.push({ name: test.name, error: error.message });
      }
      console.log('');
    }

    console.log('📊 TEST SUMMARY');
    console.log(`✅ Successes: ${results.success.length}`);
    console.log(`❌ Failures: ${results.failures.length}`);

    if (results.failures.length > 0) {
      console.log('\n💥 FAILED TESTS:');
      results.failures.forEach(failure => {
        console.log(`- ${failure.name}: ${failure.error}`);
      });
    }

    const success = results.failures.length === 0;
    console.log(`\n${success ? '🎉' : '💥'} Tests ${success ? 'PASSED' : 'FAILED'}`);

    return success;
  }
}

async function main() {
  const tester = new AuthTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
