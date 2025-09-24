import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../app/page'

// test for sign up button
describe('Page', () => {
  it('has a sign up button', () => {
    render(<Page />)
 
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/signup')
  })
})

// test for log in button
describe('Page', () => {
  it('has a log in button', () => {
    render(<Page />)
    expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/sign-in')
  })
})

// Snapshot test to check for any unepxected UI changes
test("renders welcome page", () => {
  render(<Page />);
  const { container } = render(<Page />);
  expect(container).toMatchSnapshot();
});