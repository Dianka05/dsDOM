class dsDOM extends Array {
    static _selectorCache = new Map() 
    static _globalEventHandler = new WeakMap()
    constructor(selector) {
        const elements = dsDOM.#parseSelector(selector)
        super(...elements)    
    }


    static #parseSelector(selector) {
        if (typeof selector === 'string') {
            if (selector.startsWith('<') && selector.endsWith('>')) {
                if(!this._selectorCache.has(selector)) {
                    const tamplate = document.createElement('template')
                    tamplate.innerHTML = selector.trim()
                    const nodes = [...tamplate.content.childNodes]
                    this._selectorCache.set(selector, nodes)
                    return nodes
                }
                return this._selectorCache.get(selector)
            }
            if (!this._selectorCache.has(selector)) {
                this._selectorCache.set(selector, [...document.querySelectorAll(selector)])
            }
            return this._selectorCache.get(selector)
        } else if (selector instanceof HTMLElement) {
            return [selector]
        } else if (selector instanceof NodeList || Array.isArray(selector)) {
            return [...selector]
        } else {
            return []
        }
    }

    static get body() {
        return new dsDOM(document.body)
    }
    static get document() {
        return new dsDOM(document)
    }

    static get window() {
        return new dsDOM(window)
    }

    first() {
        return new dsDOM(this[0])
    }

    last() {
        return new dsDOM(this[this.length - 1])
    }
    // Add listeners on elements
    listen(event, selector, handler) {
        if (typeof selector === 'function') {
            handler = selector;
            selector = null;
        }
    
        const parent = this[0] || document;
        const eventKey = `${event}_${selector || 'direct'}`;
    
        let parentHandlers = dsDOM._globalEventHandler.get(parent);
        if (!parentHandlers) {
            parentHandlers = new Map();
            dsDOM._globalEventHandler.set(parent, parentHandlers);
        }
    
        if (!parentHandlers.has(eventKey)) {
            const delegationHandler = (e) => {
                const target = selector ? e.target.closest(selector) : e.target;
                const isValid = Array.from(this).some(el => el.contains(target));
                
                if (target && isValid) {
                    handler.call(target, e);
                }
            };
    
            parent.addEventListener(event, delegationHandler);
            parentHandlers.set(eventKey, {
                handler: delegationHandler,
                count: 1
            });
        } else {
            const entry = parentHandlers.get(eventKey);
            entry.count++;
        }
    
        return this;
    }

    
    // Remove listeners from elements
    unlisten(event, selector) {
        if (!event && !selector) {
            const parent = this[0] || document;
            const parentHandlers = dsDOM._globalEventHandler.get(parent);
            
            if (parentHandlers) {
                parentHandlers.forEach((entry, eventKey) => {
                    const [evt, sel] = eventKey.split('_');
                    this.unlisten(evt, sel === 'direct' ? null : sel);
                });
            }
            return this;
        }
    
        const parent = this[0] || document;
        const eventKey = `${event}_${selector || 'direct'}`;
        const parentHandlers = dsDOM._globalEventHandler.get(parent);
    
        if (parentHandlers?.has(eventKey)) {
            const entry = parentHandlers.get(eventKey);
            entry.count--;
    
            if (entry.count <= 0) {
                parent.removeEventListener(event, entry.handler);
                parentHandlers.delete(eventKey);
            }
        }
    
        return this;
    }
    

    // =========== Methods for working with classes =========== //

    // Add class to elements
    addClass(...className) {
        if (!this.length) return this
      
        for (let i = 0, n = this.length; i < n; i++) {
            this[i].classList.add(...className)
        }
        
        return this
    }
    // Remove class from elements
    removeClass(...className) {
        if (!this.length) return this
       
        for (let i = 0, n = this.length; i < n; i++) {
            this[i].classList.remove(...className)
        }
        
        return this
    }
    // Toggle class on elements
    toggleClass(...className) {
        if (!this.length) return this

        for (let i = 0, n = this.length; i < n; i++) {
            this[i].classList.toggle(...className)
        }   

        return this
    }
    // Check if an element has a class
    hasClass(className) {
        if (!this.length) return false

        for (let i = 0, n = this.length; i < n; i++) {
            if (this[i].classList.contains(className)) {
                return true
            }
        }

        return false
    }

    // =========== Methods for working with attributes =========== //

    // Set and Get attribute on elements
    attr(name, value) {
        if (!this.length) return this

        if (typeof name === 'object') {
            for (let i = 0, n = this.length; i < n; i++) {
                const el = this[i]
                for (const key in name) {
                    if (name.hasOwnProperty(key)) {
                        el.setAttribute(key, name[key])                        
                    }
                }
            }

            return this
        } else if (value === undefined) {
            return this[0]?.getAttribute(name)
        } else {
            for (let i = 0, n = this.length; i < n; i++) {
                const el = this[i]
                el.setAttribute(name, value)
            }
            return this
        }
    }

    removeAttr(name) {
        if (!this.length) return this

        const isArray = Array.isArray(name)

        for (let i = 0, n = this.length; i < n; i++) {
            const el = this[i]
            
            if (isArray) {
                for (const key in name) {
                    el.removeAttribute(key)
                }
            } else {
                el.removeAttribute(name)
            }
        }

        return this
    }

    hasAttr(name) {
        if (!this.length) return this

        const isArray = Array.isArray(name)

        for (let i = 0, n = this.length; i < n; i++) {
            const el = this[i]
            
            if (isArray) {
                for (const key in name) {
                    if (!el.hasAttribute(key)) return false
                }
                return true
            } else {
                if (el.hasAttribute(name)) return true
            }
        }

        return false
    }

    // =========== Methods for working with Objects =========== //

    create(tagName) {
        if (!this.length) return this

        const newElement = document.createElement(tagName)
        this.push(newElement)

        return this
    }

    remove() {
        if (!this.length) return this

        this.unlisten()

        for (let i = 0, n = this.length; i < n; i++) {
            const el = this[i]
            el.parentNode?.removeChild(el)
        }

        this.length = 0
        return this
    }
    // Append elements to child element
    append(child) {
        if (!this.length) return this

        for (let i = 0, n = this.length; i < n; i++) {
            const el = this[i]
            if (child instanceof dsDOM) {
                for (let j = 0, n = child.length; j < n; j++) {
                    el.appendChild(child[j])
                }
            } else if (child instanceof HTMLElement) {
                el.appendChild(child)
            } else if (typeof child === 'string') {
                el.insertAdjacentHTML('beforeend', child)
            }
        }

    
        return this
    }
    // Prepend elements to child element
    prepend(child) {
        if (!this.length) return this

        for (let i = 0, n = this.length; i < n; i++) {
            const el = this[i]
            if(child instanceof dsDOM) {
                for (let j = 0, n = this.length; j < n; j++) {
                    el.insertBefore(child.elements[j], el.firstChild)
                }
            } else if (child instanceof HTMLElement) {
                el.insertBefore(child, el.firstChild)
            } else if (typeof child === 'string') {
                el.insertAdjacentHTML('afterbegin', child)
            }
        }
        
        return this
    }

    // Clone element with events
    clone(withEvents = false) {
        const clonedElements = this.map(el => el.cloneNode(true));
      
        const newDs = new dsDOM(clonedElements);
      
        if (withEvents && this._globalEventHandler) {
          clonedElements.forEach((clonedEl, index) => {
            const originalEl = this[index];
            const listeners = this._globalEventHandler.get(originalEl);
            if (listeners) {
              for (const { type, listener, options } of listeners) {
                clonedEl.addEventListener(type, listener, options);
                if (!newDs._globalEventHandler.has(clonedEl)) {
                  newDs._globalEventHandler.set(clonedEl, []);
                }
                newDs._globalEventHandler.get(clonedEl).push({ type, listener, options });
              }
            }
          });
        }
      
        return newDs;
      }
      
    
    
    

    // Set and Get text content
    text(value) {
        if (!this.length) return ''

        if (value === undefined) { 
            return this[0].textContent || ''
        } else {
            for (let i = 0, n = this.length; i < n; i++) {
                this[i].textContent = value
            }
            return this
        }
    }

    // Set and Get HTML content
    html(value){
        if (!this.length) return ''

        if (value === undefined) {
            return this[0].innerHTML
        } else {
            for (let i = 0, n = this.length; i < n; i++) {
                this[i].innerHTML = value
            }
            return this
        }
    }

    // Insert methods
    insertBefore(element) {
        if (!this.length) return this

        for (let i = 0, n = this.length; i < n; i++) {
            const el = this[i]
            
            if (element instanceof dsDOM) {
                for (let j = 0, n = this.length; j < n; j++) {
                    el.parentNode.insertBefore(this[j], el)
                }
            } else if (element instanceof HTMLElement) {
                el.parentNode.insertBefore(element, el)
            } else if (typeof element === 'string') {
                el.insertAdjacentHTML('beforebegin', element)
            }
        }
       
        return this
    }

    css(property, value) {
        if (!this.length) return this

        if (typeof property === 'object') {
            for (const key in property) {
                if (property.hasOwnProperty(key)) {
                    for (let i = 0, n = this.length; i < n; i++) {
                        const el = this[i]
                        const computedValue = typeof property[key] === 'function' 
                            ? property[key](el) 
                            : property[key]
                            el.style[key] = computedValue

                    }
                    
                }
            }
          
            return this  
        }
        else if (value === undefined) {
            return window.getComputedStyle(this[0])[property]
        } else {
            for (let i = 0, n = this.length; i < n; i++) {
                this[i].style[property] = value
            }
            return this
        }
    }

    find(selector) {
        if (!this.length) return this

        const foundElements = []
        for (let i = 0, n = this.length; i < n; i++) {
            foundElements.push(...this[i].querySelectorAll(selector))
        }

        this.splice(0, this.length ,...foundElements)
    
        return this
    }

    children() {
        if (!this.length) return this

        const childrenElements = []
        for (let i = 0, n = this.length; i < n; i++) {
            childrenElements.push(...Array.from(this[i].children))
        }

        this.push(childrenElements)
        return this
    }

    parent() {
        if (!this.length) return this

        const parentelement = []
        for (let i = 0, n = this.length; i < n; i++) {
            if (this[i].parentNode){
                parentelement.push(this[i].parentNode)
            }
        }

        this.push(parentelement)
        return this
    }

    show(value) {
        if (!this.length) return this

        for (let i = 0, n = this.length; i < n; i++) {
            const el = this[i];

            if (!el.dataset.originalDisplay) {
                el.dataset.originalDisplay = el.style.display || ''
            }

            const originalDisplay = el.dataset.originalDisplay

            if (typeof value === 'string') {
                const isValid = CSS.supports('display', value)
                el.style.display = isValid 
                    ? value 
                    : (originalDisplay || 'block')

            } else {
                el.style.display = originalDisplay || 'block'
            }
        
        }


        return this
    }
    hide() {
        if (!this.length) return this

        for (let i = 0, n = this.length; i < n; i++) {
            const el = this[i]
            
            if (!el.dataset.originalDisplay) {
                el.dataset.originalDisplay = el.style.display || ''
            }

            el.style.display = 'none'
        }

        return this
    }
}