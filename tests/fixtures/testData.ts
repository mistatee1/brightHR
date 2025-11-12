/**
 * Test data generator for employee fixtures.
 * Generates randomized employee details for testing.
 */

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Jennifer',
  'William', 'Linda', 'David', 'Barbara', 'Richard', 'Susan',
  'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty',
  'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna',
  'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
  'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez',
  'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore',
  'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott',
  'Torres', 'Peterson', 'Phillips', 'Campbell'
];

interface EmployeeTestData {
  first: string;
  last: string;
  email: string;
}

/**
 * Generate a random employee with randomized first name, last name, and email.
 * Email includes a random number to ensure uniqueness across test runs.
 */
export function generateRandomEmployee(): EmployeeTestData {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const randomSuffix = Math.floor(Math.random() * 10000);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}+${randomSuffix}@example.com`;

  return {
    first: firstName,
    last: lastName,
    email
  };
}

/**
 * Generate multiple unique employees.
 */
export function generateEmployees(count: number): EmployeeTestData[] {
  const employees: EmployeeTestData[] = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < count; i++) {
    let employee: EmployeeTestData;
    // Ensure email uniqueness
    do {
      employee = generateRandomEmployee();
    } while (usedEmails.has(employee.email));

    usedEmails.add(employee.email);
    employees.push(employee);
  }

  return employees;
}
