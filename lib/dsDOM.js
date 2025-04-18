class dsDOM extends Array {
    static _selectorCache = new Map() 
    constructor(selector) {
        const elements = dsDOM.#parseSelector(selector)
        super(...elements)    
        
        //Event storage
        this._eventHandler = new WeakMap()

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

    first() {
        return new dsDOM(this[0])
    }

    last() {
        return new dsDOM(this[this.length - 1])
    }

    // Add listeners on elements
    listen(event, selector, handler) {

        const hasSelector = typeof selector === 'string'
        if (!hasSelector) {
            handler = selector
            selector = null
        }

        for(let i = 0, n = this.length; i < n; i++) {
            const el = this[i]

            let events = this._eventHandler.get(el)

            if (!events) {
                events = new Map()
                this._eventHandler.set(el, events)
            }

            if (!events.has(event)) {
                events.set(event, new Set())
            }
            
            let callback
            if (hasSelector) {
                callback = function(e) {
                    const target = e.target.closest(selector)
                    if (target && target !== el) {
                        handler.call(target, e)
                    }
                }
            } else {
                callback = function(e) {
                    handler.call(el, e)
                }
            }
            
            const tuple = {handler, selector, callback }
            events.get(event).add(tuple)
            el.addEventListener(event, callback)
    
        }
        return this
    }
    // Remove listeners from elements
    unlisten(event, selector, handler) {
        for (let i = 0, n = this.length; i < n; i++) {
            const el = this[i]

            const events = this._eventHandler.get(el)
            if (!events) continue

            const eventTypes = event ? [event] : Array.from(events.keys())
            // remove all event handlers
            for (let j = 0, nj = eventTypes.length; j < nj; j++) {
                const evt = eventTypes[j]
                const handlers = events.get(evt)
                if (!handlers) continue

                const toRemove = []

                for (let k = 0, nk = handlers.size; k < nk; k++) {
                    const entry = [...handlers][k]
                    const matchSelector = selector === null || entry.selector === selector
                    const matchHandler = handler === null || entry.handler === handler

                    if (matchSelector && matchHandler) {
                        el.removeEventListener(evt, entry.callback)
                        toRemove.push(entry)
                    }
                }
                
                for (let k = 0, nk = toRemove.length; k < nk; k++) { 
                    handlers.delete(toRemove[k])
                }

                if (handlers.size === 0) 
                    delete events[evt]

            }
            
            if(events.length === 0) this._eventHandler.delete(el)
        }
        return this
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
            this._eventHandler.delete(el)
        }

        this.push([])
        return this
    }
    // Append elements to child element
    append(child) {
        if (!this.length) return this

        for (let i = 0, n = this.length; i < n; i++) {
            const el = this[i]
            if (child instanceof dsDOM) {
                for (let j = 0, n = this.length; j < n; j++) {
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
    clone() {
        if (!this.length) return [];
    
        const clonedElements = [];
    
        for (let i = 0, n = this.length; i < n; i++) {
            const el = this[i];
            const clone = el.cloneNode(true);
    
            const events = this._eventHandler.get(el) || {};
            const clonedEvents = {};
    
            for (const eventType in events) {
                if (events.hasOwnProperty(eventType)) {
                    clonedEvents[eventType] = [];
    
                    for (let j = 0, m = events[eventType].length; j < m; j++) {
                        const handler = events[eventType][j];
    
                        if (!clonedEvents[eventType].includes(handler)) {
                            clone.addEventListener(eventType, handler);
                            clonedEvents[eventType].push(handler);
                        }
                    }
                }
            }
    
            this._eventHandler.set(clone, clonedEvents);
            clonedElements.push(clone);
        }
    
        return clonedElements;
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

        this.push(foundElements)
    
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