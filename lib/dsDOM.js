class dsDOM {
    constructor(selector) {
        this.elements = this.#parseSelector(selector)

        //Event storage
        this._eventHandler = new WeakMap()
    }

    #parseSelector(selector) {
        if (typeof selector === 'string') {
            return [...document.querySelectorAll(selector)]
        } else if (selector instanceof HTMLElement) {
            return [selector]
        } else if (selector instanceof NodeList || Array.isArray(selector)) {
            return [...selector]
        } else {
            return []
        }
    }

    first() {
        return new DSlib(this.elements[0])
    }

    last() {
        return new DSlib(this.elements[this.elements.length - 1])
    }

    // Add listeners on elements
    listen(event, selector, handler) {
        for(let i = 0, n = this.elements.length; i < n; i++) {
            const el = this.elements[i]

            const eventCashe = this._eventHandler.get(el)
            
            
            if (!eventCashe) {
                eventCashe = {}
                this._eventHandler.set(el, eventCashe)
            }

            const casheKey = `${event}-${selector}`
            if (eventCashe[casheKey]) continue
            
            const delegatingHandler = (e) => {
                const target = el.target
                if (!selector || target.matches(selector)) {
                    handler.call(target, e)
                }
            }
            
            el.addEventListener(event, delegatingHandler)
                
            if (!eventCashe[event]) {
                eventCashe[event] = []
            }
    
            eventCashe[event].push({selector, handler: delegatingHandler})
            eventCashe[event] = true
        }
        return this
    }
    // Remove listeners from elements
    unlisten(event, selector, handler) {
        for (let i = 0, n = this.elements.length; i < n; i++) {
            const el = this.elements[i]

            if (!this._eventHandler || !this._eventHandler.has(el)) continue
            
            const events = this._eventHandler.get(el)

            // remove all event handlers
            if(!event) {
                const eventKeys = Object.keys(events)

                for (let j = 0, nj = eventKeys.length; j < nj; j++) {
                    const evt = eventKeys[j]
                    const handlers = events[j]

                    for (let k = 0, nk = handlers.length; k < nk; k++) {
                        el.removeEventListener(evt, handlers[k].handler)
                    }
                }
                this._eventHandler.delete(el)
                continue
            }

            if (!events[event]) continue

            if(!selector && !handler) {
                // remove all event handlers for specific listener type (click, mousemove, ...)
                const handlers = events[event]
                for (let k = 0, nk = handlers.length; k < nk; k++) {
                    el.removeEventListener(event, handlers[k].handler)
                }
                delete events[event]
            } else {
                // remove all event handlers for specific listener type and selector (click, mousemove, ...)
                const handlers = events[event]
                for (let k = handlers.length - 1; k >= 0; k--) {
                    const {selector: storedSelector, handler: storedHandler} = handlers[k]
                    const shouldRemove = (!selector || storedSelector === selector)
                                       && (!handler || storedHandler === handler)
                    if (shouldRemove) {
                        el.removeEventListener(event, storedHandler)
                        handlers.splice(k, 1) // remove handler from handlers
                    }
                }

                if(handlers.length === 0) delete events[event]
            }
            if(Object.keys(events).length === 0) this._eventHandler.delete(el)
        }
        return this
    }

    // =========== Methods for working with classes =========== //

    // Add class to elements
    addClass(className) {
        if (!this.elements.length) return this
      
        for (let i = 0, n = this.elements.length; i < n; i++) {
            this.elements[i].classList.add(className)
        }
        
        return this
    }
    // Remove class from elements
    removeClass(className) {
        if (!this.elements.length) return this
       
        for (let i = 0, n = this.elements.length; i < n; i++) {
            this.elements[i].classList.remove(className)
        }
        
        return this
    }
    // Toggle class on elements
    toggleClass(className) {
        if (!this.elements.length) return this

        for (let i = 0, n = this.elements.length; i < n; i++) {
            this.elements[i].classList.toggle(className)
        }   

        return this
    }
    // Check if an element has a class
    hasClass(className) {
        if (!this.elements.length) return this

        for (let i = 0, n = this.elements.length; i < n; i++) {
            if (this.elements[i].classList.contains(className)) {
                return true
            }
        }

        return false
    }

    // =========== Methods for working with attributes =========== //

    // Set and Get attribute on elements
    attr(name, value) {
        if (!this.elements.length) return this

        if (typeof name === 'object') {
            for (let i = 0, n = this.elements.length; i < n; i++) {
                const el = this.elements[i]
                for (const key in name) {
                    if (name.hasOwnProperty(key)) {
                        el.setAttribute(key, name[key])                        
                    }
                }
            }

            return this
        } else if (value === undefined) {
            return this.elements[0]?.getAttribute(name)
        } else {
            for (let i = 0, n = this.elements.length; i < n; i++) {
                const el = this.elements[i]
                el.setAttribute(name, value)
            }
            return this
        }
    }

    removeAttr(name) {
        if (!this.elements.length) return this

        const isArray = Array.isArray(name)

        for (let i = 0, n = this.elements.length; i < n; i++) {
            const el = this.elements[i]
            
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
        if (!this.elements.length) return this

        const isArray = Array.isArray(name)

        for (let i = 0, n = this.elements.length; i < n; i++) {
            const el = this.elements[i]
            
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
        if (!this.elements.length) return this

        const newElement = document.createElement(tagName)
        this.elements = [newElement]

        return this
    }

    remove() {
        if (!this.elements.length) return this

        this.unlisten()

        for (let i = 0, n = this.elements.length; i < n; i++) {
            const el = this.elements[i]
            el.parentNode.removeChild(el)
        }

        this.elements = []
        return this
    }
    // Append elements to child element
    append(child) {
        if (!this.elements.length) return this

        for (let i = 0, n = this.elements.length; i < n; i++) {
            const el = this.elements[i]
            if (child instanceof DSlib) {
                for (let j = 0, n = this.elements.length; j < n; j++) {
                    el.appendChild(child.elements[j])
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
        if (!this.elements.length) return this

        for (let i = 0, n = this.elements.length; i < n; i++) {
            const el = this.elements[i]
            if(child instanceof DSlib) {
                for (let j = 0, n = this.elements.length; j < n; j++) {
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
        if (!this.elements.length) return this

        const clonedElements = []
        for (let i = 0, n = this.elements.length; i < n; i++) {
            const el = this.elements[i]
            const clone = el.cloneNode(true)
            const events = this._eventHandler.get(el) || {}
    
            const clonedEvents = {}

            for (const eventType in events) {
                if (events.hasOwnProperty(eventType)) {
                    clonedEvents[eventType] = []
                    for (let j = 0, n = events[eventType].length; j < n; j++) {
                        const handler = events[eventType][j]

                        if (!clonedEvents[eventType].includes(handler)) {
                            clone.addEventListener(eventType, handler)
                            clonedEvents[eventType].push(handler)
                        }
                    }
                }
            }
          
            this._eventHandler.set(clone, clonedEvents)
            clonedElements.push(clone)

        }
    
        return new DSlib(clonedElements)
    }

    // Set and Get text content
    text(value) {
        if (!this.elements.length) return ''

        if (value === undefined) { 
            return this.elements[0].textContent || ''
        } else {
            for (let i = 0, n = this.elements.length; i < n; i++) {
                this.elements[i].textContent = value
            }
            return this
        }
    }

    // Set and Get HTML content
    html(value){
        if (!this.elements.length) return ''

        if (value === undefined) {
            return this.elements[0].innerHTML
        } else {
            for (let i = 0, n = this.elements.length; i < n; i++) {
                this.elements[i].innerHTML = value
            }
            return this
        }
    }

    // Insert methods
    insertBefore(element) {
        if (!this.elements.length) return this

        for (let i = 0, n = this.elements.length; i < n; i++) {
            const el = this.elements[i]
            
            if (element instanceof DSlib) {
                for (let j = 0, n = this.elements.length; j < n; j++) {
                    el.parentNode.insertBefore(this.elements[j], el)
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
        if (!this.elements.length) return this

        if (typeof property === 'object') {
            for (const key in property) {
                if (property.hasOwnProperty(key)) {
                    for (let i = 0, n = this.elements.length; i < n; i++) {
                        const el = this.elements[i]
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
            return window.getComputedStyle(this.elements[0])[property]
        } else {
            for (let i = 0, n = this.elements.length; i < n; i++) {
                this.elements[i].style[property] = value
            }
            return this
        }
    }

    find(selector) {
        if (!this.elements.length) return this

        const foundElements = []
        for (let i = 0, n = this.elements.length; i < n; i++) {
            foundElements.push(...this.elements[i].querySelectorAll(selector))
        }

        this.elements = foundElements
        return this
    }

    children() {
        if (!this.elements.length) return this

        const childrenElements = []
        for (let i = 0, n = this.elements.length; i < n; i++) {
            childrenElements.push(...Array.from(this.elements[i].children))
        }

        this.elements = childrenElements
        return this
    }

    parent() {
        if (!this.elements.length) return this

        const parentelement = []
        for (let i = 0, n = this.elements.length; i < n; i++) {
            if (this.elements[i].parentNode){
                parentelement.push(this.elements[i].parentNode)
            }
        }

        this.elements = parentelement
        return this
    }

    show(value) {
        if (!this.elements.length) return this

        for (let i = 0, n = this.elements.length; i < n; i++) {
            const el = this.elements[i];

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
        if (!this.elements.length) return this

        for (let i = 0, n = this.elements.length; i < n; i++) {
            const el = this.elements[i]
            
            if (!el.dataset.originalDisplay) {
                el.dataset.originalDisplay = el.style.display || ''
            }

            el.style.display = 'none'
        }

        return this
    }
}