
export const SUPPORTED_LANGUAGES = [
  {
    name: 'JavaScript',
    value: 'javascript',
    placeholder: `// Paste your JavaScript code here...
function factorial(n) {
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);
}`
  },
  {
    name: 'Python',
    value: 'python',
    placeholder: `# Paste your Python code here...
def fibonacci(n):
    a, b = 0, 1
    for i in range(n):
        print(a)
        a, b = b, a+b`
  },
  {
    name: 'TypeScript',
    value: 'typescript',
    placeholder: `// Paste your TypeScript code here...
interface User {
  id: number;
  name: string;
}

function getUserName(user: User): string {
  return user.name;
}`
  },
    {
    name: 'Java',
    value: 'java',
    placeholder: `// Paste your Java code here...
import java.util.ArrayList;

class Main {
  public static void main(String[] args) {
    ArrayList<String> cars = new ArrayList<String>();
    cars.add("Volvo");
    cars.add("BMW");
    System.out.println(cars);
  }
}`
  }
];
