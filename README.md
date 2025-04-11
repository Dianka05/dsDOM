# 🚀 dsDOM

**dsDOM** is a lightweight and experimental DOM manipulation library. It’s inspired by jQuery but built from scratch using modern JavaScript APIs. The project is at an early stage and still actively evolving.

[📈 View Benchmark](https://www.measurethat.net/Benchmarks/ShowResult/599034)

---

## ⚙️ Installation

CDN (jsDelivr):

```html
<script src="https://cdn.jsdelivr.net/gh/Dianka05/dsDOM@latest/lib/dsDOM.js"></script>
```

Local:

```html
<script src="/lib/dsDOM.js"></script>
```

---

## ✅ Quick Start

```js
const el = new dsDOM('#myDiv');

el.addClass('active');
el.css({ color: 'red', fontSize: '18px' });
el.listen('click', null, () => console.log('Clicked!'));
```

---

## 📚 API (currently available)

### 🔎 Selection

```js
new dsDOM('.selector') // Returns a dsDOM wrapper
```

```js
el.find('span') // Finds nested elements inside the current element
```

### 🎨 Class Manipulation

```js
el.addClass('className');              // Supports multiple classes
el.removeClass('className');          // Removes a class
el.toggleClass('className');          // Toggles a class
el.hasClass('className');             // Returns true/false
```

### ⚙️ Attributes

```js
el.attr('data-id');                  // Get attribute value
el.attr('data-id', '123');           // Set attribute value
el.removeAttr('data-id');            // Remove attribute
```

### 🧬 CSS Manipulation

```js
el.css({ color: 'blue', fontSize: '20px' });
```

### 🗣 Event Handling

```js
el.listen('click', null, () => alert('Clicked!'));
```

With delegation:

```js
new dsDOM('ul').listen('click', 'li', (e) => {
  console.log('Clicked list item', e.target);
});
```

### 🧽 Removing Elements

```js
el.remove();
```

### 🔁 Cloning

```js
const copy = el.clone();
```

### 🧱 Creating Elements

```js
const newDiv = new dsDOM().create('div');
```

---

## ⚠️ Not Yet Implemented (Planned)

- `.val()` support
- Animations
- `fetch()` wrapper

---



## ⚡ Benchmark Comparison (on MeasureThat)

| Operation               | dsDOM                | jQuery               |
|------------------------|----------------------|----------------------|
| Cloning                | 1.22 million ops/sec | 76k ops/sec          |
| Add class              | 1.3 million ops/sec  | 488k ops/sec         |
| Style manipulation     | 1.17 million ops/sec | 293k ops/sec         |
| Remove element         | 2.5 million ops/sec  | 750k ops/sec         |
| Element selection      | 4.18 million ops/sec | 750k ops/sec         |

[🔗 View Benchmark](https://www.measurethat.net/Benchmarks/ShowResult/599034)

---

## 👀 Project Goals

- Minimal size and high performance
- Simple API
- Transparent and readable code
- Primary focus on DOM manipulation

---

## ✨ Author

> Created by Dianka05  
[GitHub](https://github.com/Dianka05) · [LinkedIn](https://www.linkedin.com/in/dianastoyka)

---

## 📝 License

MIT
