# 🚀 dsDOM

**dsDOM** is a lightweight and experimental DOM manipulation library. It’s inspired by jQuery but built from scratch using modern JavaScript APIs. The project is at an early stage and still actively evolving.

[📈 View Benchmark = dsDOM vs JQuery (clone, event, add clsss, remove class, selection, remove element, css) ](https://www.measurethat.net/Benchmarks/ShowResult/601542)


[📈 View Benchmark = dsDOM vs Vanilla vs Cash vs Bliss vs Umbrella vs Zepto vs jQuery JS Library Speed Test](https://www.measurethat.net/Benchmarks/ShowResult/599100)


---

## ⚙️ Installation

CDN (jsDelivr):

```html
<script src="https://cdn.jsdelivr.net/gh/Dianka05/dsDOM@v0.1.2/lib/dsDOM.js"></script>
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
const el3 = new dsDOM('#testButton');
el3.listen('click', () => console.log('first'));
dsDOM.document.listen('click', '#testButton', () => console.log('first'));
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

> Based on test v0.1.1: [dsDOM vs Vanilla vs Cash vs Bliss vs Umbrella vs Zepto](https://www.measurethat.net/Benchmarks/Show/34205/3/dsdom-vs-vanilla-vs-cash-vs-bliss-vs-umbrella-vs-zepto)

| **Library**         | **Get ID**               | **Get Text**             | **Get HTML**             |
|---------------------|--------------------------|--------------------------|--------------------------|
| **Vanilla JS**      | 22,975,690 ops/sec       | 7,063,657 ops/sec        | 6,342,637 ops/sec        |
| **dsDOM**           | **4,014,924 ops/sec**    | **2,941,924 ops/sec**      | **2,696,150 ops/sec**      |
| **Cash**            | 3,566,875 ops/sec        | 2,718,670 ops/sec          | 2,488,740 ops/sec          |
| **Bliss**           | 2,184,294 ops/sec        | 1,817,807 ops/sec          | 2,389,749 ops/sec           |
| **Zepto**           | 2,877,201 ops/sec          | 783,890 ops/sec          | 1,747,541 ops/sec          |
| **Umbrella**        | 496,050 ops/sec          | 476,626 ops/sec          | 461,320 ops/sec          |
| **jQuery**          | 2,389,749 ops/sec          | 1,304,159 ops/sec          | 1,485,034 ops/sec          |

> Measured using [MeasureThat.net](https://www.measurethat.net)


| Operation               | dsDOM                | jQuery               |
|------------------------|----------------------|----------------------|
| Cloning                | 340,435 ops/sec |  78,011 ops/sec          |
| Add class (single/multiple)              | 1,385,516 ops/sec /  794,052 ops/sec  |  505,400 ops/sec /  252,239 ops/sec         |
| Style manipulation     | 898,944 ops/sec |  268,165  ops/sec         |
| Remove element         | 3,272,526 ops/sec  | 762,805 ops/sec         |
| Element selection      | 4,114,659 ops/sec | 728,563 ops/sec         |
| event element -> child      | 1,713,778 ops/sec | 501,785 ops/sec         |
| event document -> element     | 2,516,111 ops/sec | 551,252 ops/sec         |

[🔗 View Benchmark](https://www.measurethat.net/Benchmarks/ShowResult/601542)

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
