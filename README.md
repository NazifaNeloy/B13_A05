

## Answers to Questions

### 1. Difference between var, let, and const

**var**  
- The old way (pre-ES6). It's function-scoped, which means it ignores block {} boundaries (like inside if-statements). It causes bugs because you can accidentally re-declare it. Avoid using this.

**let**  
- Block-scoped. It only exists inside the curly braces {} where it was made. Use this when the variable needs to be updated later

**const**  
- TBlock-scoped but read-only. You can't reassign it (x = 5). I use this by default for everything unless I know the value needs to change.


---


### 2. The Spread Operator (...)

- Main use case: Copying data without referencing the original memory spot.
- Example: const newArr = [...oldArr] creates a real copy. If I just did newArr = oldArr, changing one would change the other (bad).
- Also good for merging: const combined = [...arr1, ...arr2].


---

### 3. map() vs filter() vs forEach()

**map()**  
- Runs a function on every item and returns a new array of the same length. Use this to transform data 

**filter()**  
- Checks a condition on every item and returns a new array with only the items that passed (returned true). Use this to delete/hide things.

**forEach()**  
- ust loops through the items. Returns undefined. Use this if you just want to console.log something or trigger a side effect, but don't need a result list.

---

### 4. Arrow Functions

- Clean syntax: const doMath = (a, b) => a + b
 
- Implicit Return: If it's on one line, you don't need the return keyword or curly braces {}. It just returns the result automatically.

---

### 5. What is the difference between preventDefault() and stopPropagation() methods?

- Allows String Interpolation: You can inject variables directly using ${variableName}.

- Supports multi-line strings without needing \n.
**Comparison:**  
- Old: 'Hello ' + name + '!'
- New: `Hello ${name}!`

