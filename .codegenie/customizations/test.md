# Testing Practices Cheat Sheet

## Testing Libraries and Frameworks

- Jest: Primary testing framework
- @testing-library/react: For testing React components
- @testing-library/user-event: For simulating user interactions

## Mocking and Stubbing

### Jest Mocks

- Use `jest.mock()` to mock entire modules
- Use `jest.spyOn()` to create spies on specific functions
- Use `mockImplementation()` to provide custom implementations for mocked functions
- Use `mockResolvedValue()` for mocking async functions that return promises

### Example:

```javascript
jest.mock('../api/userService');
const userService = require('../api/userService');

userService.getUser.mockResolvedValue({ id: 1, name: 'John Doe' });
```

## Fake Implementations

- Create fake objects or functions to simulate complex dependencies
- Use factory functions to generate test data

### Example:

```javascript
const fakeUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com'
};

const createFakePost = (id) => ({
  id,
  title: `Test Post ${id}`,
  content: `This is test content for post ${id}`
});
```

## Testing React Components

- Use `render()` from @testing-library/react to render components
- Use `screen` object to query rendered elements
- Use `fireEvent` or `userEvent` to simulate user interactions

### Example:

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

test('MyComponent renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello, World!')).toBeInTheDocument();
});

test('Button click triggers action', async () => {
  const mockHandler = jest.fn();
  render(<MyComponent onButtonClick={mockHandler} />);
  await userEvent.click(screen.getByRole('button'));
  expect(mockHandler).toHaveBeenCalledTimes(1);
});
```

## Asynchronous Testing

- Use `async/await` for testing asynchronous code
- Use `waitFor()` to wait for asynchronous operations to complete

### Example:

```javascript
test('async operation completes', async () => {
  render(<AsyncComponent />);
  await waitFor(() => {
    expect(screen.getByText('Operation complete')).toBeInTheDocument();
  });
});
```

## Test Structure

- Use `describe` blocks to group related tests
- Use `beforeEach` and `afterEach` for setup and teardown
- Use `it` or `test` for individual test cases

### Example:

```javascript
describe('UserComponent', () => {
  beforeEach(() => {
    // Setup code
  });

  afterEach(() => {
    // Teardown code
  });

  it('renders user information', () => {
    // Test code
  });

  it('handles error state', () => {
    // Test code
  });
});
```

## Snapshot Testing

- Use `toMatchSnapshot()` for component snapshot testing

### Example:

```javascript
test('Component snapshot', () => {
  const { asFragment } = render(<MyComponent />);
  expect(asFragment()).toMatchSnapshot();
});
```

## Coverage Reports

- Use Jest's built-in coverage reporting
- Aim for high test coverage, but focus on critical paths

## Best Practices

- Write descriptive test names
- Follow the Arrange-Act-Assert pattern
- Test both success and failure scenarios
- Keep tests independent and isolated
- Avoid testing implementation details
- Use meaningful assertions