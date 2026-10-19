import { SAUDI_CITIES, type SaudiCityOption } from '../src/data/saudiCities';

const validBillingChars = /^[a-zA-Z0-9\s.,'#\-\/()&]*$/;
const arabicCharPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function runDoctorShieldCityTestSuite() {
  console.log('--- DOCTOR SHIELD SAUDI CITY DROPDOWN TEST SUITE ---\n');
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failedCount++;
    }
  }

  // 1. Verify city list length and presence
  assert(SAUDI_CITIES.length === 16, `SAUDI_CITIES contains exactly 16 main cities (found ${SAUDI_CITIES.length})`);

  // 2. Specific test: Selecting "Riyadh - الرياض" stores and submits exactly "Riyadh"
  const riyadh = SAUDI_CITIES.find(c => c.value === 'Riyadh');
  assert(!!riyadh, 'Found Riyadh option in list');
  assert(riyadh?.label === 'Riyadh - الرياض', `Riyadh label is "Riyadh - الرياض" (got "${riyadh?.label}")`);
  assert(riyadh?.value === 'Riyadh', `Riyadh submitted value is "Riyadh" (got "${riyadh?.value}")`);
  assert(!arabicCharPattern.test(riyadh?.value || ''), 'Riyadh submitted value contains NO Arabic characters');

  // 3. Specific test: Selecting "Jeddah - جدة" stores and submits exactly "Jeddah"
  const jeddah = SAUDI_CITIES.find(c => c.value === 'Jeddah');
  assert(!!jeddah, 'Found Jeddah option in list');
  assert(jeddah?.label === 'Jeddah - جدة', `Jeddah label is "Jeddah - جدة" (got "${jeddah?.label}")`);
  assert(jeddah?.value === 'Jeddah', `Jeddah submitted value is "Jeddah" (got "${jeddah?.value}")`);
  assert(!arabicCharPattern.test(jeddah?.value || ''), 'Jeddah submitted value contains NO Arabic characters');

  // 4. Test all 16 cities for canonical value, bilingual label, and absence of Arabic in value
  const expectedCities = [
    { value: 'Riyadh', label: 'Riyadh - الرياض' },
    { value: 'Jeddah', label: 'Jeddah - جدة' },
    { value: 'Makkah', label: 'Makkah - مكة المكرمة' },
    { value: 'Madinah', label: 'Madinah - المدينة المنورة' },
    { value: 'Dammam', label: 'Dammam - الدمام' },
    { value: 'Al Khobar', label: 'Al Khobar - الخبر' },
    { value: 'Taif', label: 'Taif - الطائف' },
    { value: 'Abha', label: 'Abha - أبها' },
    { value: 'Tabuk', label: 'Tabuk - تبوك' },
    { value: 'Buraydah', label: 'Buraydah - بريدة' },
    { value: 'Hail', label: 'Hail - حائل' },
    { value: 'Jazan', label: 'Jazan - جازان' },
    { value: 'Najran', label: 'Najran - نجران' },
    { value: 'Jubail', label: 'Jubail - الجبيل' },
    { value: 'Yanbu', label: 'Yanbu - ينبع' },
    { value: 'Al Ahsa', label: 'Al Ahsa - الأحساء' },
  ];

  for (const expected of expectedCities) {
    const found = SAUDI_CITIES.find(c => c.value === expected.value);
    assert(!!found, `City option "${expected.value}" exists in SAUDI_CITIES`);
    assert(found?.label === expected.label, `City "${expected.value}" label matches expected "${expected.label}" (got "${found?.label}")`);
    assert(found?.value === expected.value, `City "${expected.value}" value matches expected canonical English (got "${found?.value}")`);
    assert(!arabicCharPattern.test(found?.value || ''), `City "${expected.value}" value contains zero Arabic characters`);
    assert(validBillingChars.test(found?.value || ''), `City "${expected.value}" passes HyperPay validBillingChars regex`);
  }

  // 5. Test required field validation logic
  function validateCityField(cityValue: string): { valid: boolean; error?: string } {
    if (!cityValue.trim()) {
      return { valid: false, error: 'City is required' };
    }
    if (!validBillingChars.test(cityValue.trim())) {
      return { valid: false, error: 'Please enter billing address details using English characters.' };
    }
    return { valid: true };
  }

  const emptyResult = validateCityField('');
  assert(!emptyResult.valid && emptyResult.error === 'City is required', 'Empty city value fails required validation with "City is required"');

  const arabicDirectResult = validateCityField('الرياض');
  assert(!arabicDirectResult.valid && arabicDirectResult.error?.includes('English characters'), 'Arabic raw input fails Latin billing validation');

  const selectedResult = validateCityField(riyadh!.value);
  assert(selectedResult.valid, 'Selected canonical English city passes all validation');

  // 6. Test Doctor Shield Registration and HyperPay payload construction
  const mockRegistrationPayload = {
    fullName: 'Dr. Khaled Mohammed',
    phone: '0512345678',
    email: 'khaled@example.com',
    idNumber: '1012345678',
    specialty: 'Pediatrics',
    city: riyadh!.value, // Stored English value
    employer: 'King Faisal Specialist Hospital',
    notes: 'None',
    hasBeenConvicted: 'no',
  };

  assert(mockRegistrationPayload.city === 'Riyadh', `Registration payload city is strictly canonical English: "${mockRegistrationPayload.city}"`);
  assert(!arabicCharPattern.test(mockRegistrationPayload.city), 'Registration payload city has NO Arabic characters');

  // 7. Test HyperPay billing address payload construction
  const mockBillingPayload = {
    street1: 'King Fahd Road 12',
    city: mockRegistrationPayload.city,
    state: 'Riyadh Province',
    country: 'SA',
    postcode: '12214',
  };

  const hyperPayCheckoutBody = {
    'billing.street1': mockBillingPayload.street1,
    'billing.city': mockBillingPayload.city,
    'billing.state': mockBillingPayload.state,
    'billing.country': mockBillingPayload.country,
    'billing.postcode': mockBillingPayload.postcode,
  };

  assert(hyperPayCheckoutBody['billing.city'] === 'Riyadh', `HyperPay billing.city payload is "Riyadh" (got "${hyperPayCheckoutBody['billing.city']}")`);
  assert(validBillingChars.test(hyperPayCheckoutBody['billing.city']), 'HyperPay billing.city passes validBillingChars restriction');
  assert(!arabicCharPattern.test(hyperPayCheckoutBody['billing.city']), 'HyperPay billing.city contains zero Arabic characters');

  console.log(`\nResults: ${passedCount} passed, ${failedCount} failed.`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runDoctorShieldCityTestSuite();
