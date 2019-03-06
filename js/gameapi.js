

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/helper/detection.js

var detection = (function () {
  var mod = { is: {} },
    d,
    ua = navigator.userAgent;
  mod.detect = {
    html5: function () {
      return document.createElement('canvas').getContext !== undefined;
    },
    touch: function () {
      var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
      return !!supportsTouch;
    },
    android: function () {
      return !!ua.match(/Android/i);
    },
    ios: function () {
      return !!ua.match(/iPhone|iPad|iPod/i);
    },
    ios7: function () {
      return mod.detect.ios && ua.match(/version\/7\./i);
    },
    webkitVersion: function () {
      var regex = new RegExp(/AppleWebKit\/([\d.]+)/),
        result = regex.exec(ua),
        webkitVersion = result === null ? false : parseFloat(result[1]);
      return webkitVersion;
    },
    androidStockBrowser: function () {
      if (mod.is.android && mod.is.webkitVersion && mod.is.webkitVersion < 537) {
        return true;
      }
      return false;
    },
    standalone: function () {
      return !!window.navigator.standalone;
    },
    smartphone: function () {
      return (ua.match(/Android.*Mobile|iPhone|IEMobile|WPDesktop/i)) ? true : false;
    },
    tablet: function () {
      if (window.self != window.top)
        return false;
      // Android smartphones have the combination Android...Mobile, tablets only Android
      var androidTablet = (mod.is.android && !mod.is.smartphone),
        iPad = ua.match(/iPad/i) ? true : false;
      return (androidTablet || iPad);
    },
    pc: function () {
      return (!mod.is.smartphone && !mod.is.tablet);
    },
    phantom: function () {
      return !!(window.callPhantom || ua.match(/PhantomJS/));
    },
    iframe: function () {
      return window.self != window.top;
    }
  };

  for (d in mod.detect) {
    if (typeof mod.detect[d] === 'function') {
      mod.is[d] = mod.detect[d]();
    }
  }

  return mod;
})();

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/plugins/zepto.js

/* Zepto v1.1.2 - zepto event ajax form ie - zeptojs.com/license */


var Zepto = (function () {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = ['after', 'prepend', 'before', 'append'],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]*)$/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    }

  zepto.matches = function (element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
      element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj) { return obj != null && obj == obj.window }
  function isDocument(obj) { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj) { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function (item) { return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function (str) { return str.replace(/-+(.)?/g, function (match, chr) { return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      .replace(/([a-z\d])([A-Z])/g, '$1_$2')
      .replace(/_/g, '-')
      .toLowerCase()
  }
  uniq = function (array) { return filter.call(array, function (item, idx) { return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    if (!elementDisplay[nodeName]) {
      elementDisplay[nodeName] = "block"
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function (node) { if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function (html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function () {
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function (key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function (dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function (object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function (selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function (selector, context) {
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function (target) {
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function (arg) { extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function (element, selector) {
    var found,
      maybeID = selector[0] == '#',
      maybeClass = !maybeID && selector[0] == '.',
      nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
      isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ((found = element.getElementById(nameOnly)) ? [found] : []) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
        slice.call(
          isSimple && !maybeID ?
            maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
              element.getElementsByTagName(selector) : // Or a tag
            element.querySelectorAll(selector) // Or it's not simple, and we need to query all
        )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = function (parent, node) {
    return parent !== node && parent.contains(node)
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value) {
    var klass = node.className,
      svg = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        (value == "false" ? false :
          value == "null" ? null :
            !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
              /^[\[\{]/.test(value) ? $.parseJSON(value) :
                value)
        : value
    } catch (e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function (obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function (elem, array, i) {
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function (str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = {}
  $.expr = {}

  $.map = function (elements, callback) {
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function (elements, callback) {
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function (elements, callback) {
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
    class2type["[object " + name + "]"] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function (fn) {
      return $($.map(this, function (el, i) { return fn.call(el, i, el) }))
    },
    slice: function () {
      return $(slice.apply(this, arguments))
    },

    ready: function (callback) {
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function () { callback($) }, false)
      return this
    },
    get: function (idx) {
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function () { return this.get() },
    size: function () {
      return this.length
    },
    remove: function () {
      return this.each(function () {
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function (callback) {
      emptyArray.every.call(this, function (el, idx) {
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function (selector) {
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function (element) {
        return zepto.matches(element, selector)
      }))
    },
    add: function (selector, context) {
      return $(uniq(this.concat($(selector, context))))
    },
    is: function (selector) {
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function (selector) {
      var nodes = []
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function (idx) {
          if (!selector.call(this, idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function (el) {
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function (selector) {
      return this.filter(function () {
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function (idx) {
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function () {
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function () {
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function (selector) {
      var result, $this = this
      if (typeof selector == 'object')
        result = $(selector).filter(function () {
          var node = this
          return emptyArray.some.call($this, function (parent) {
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function () { return zepto.qsa(this, selector) })
      return result
    },
    closest: function (selector, context) {
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function (selector) {
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function (node) {
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function (selector) {
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function (selector) {
      return filtered(this.map(function () { return children(this) }), selector)
    },
    contents: function () {
      return this.map(function () { return slice.call(this.childNodes) })
    },
    siblings: function (selector) {
      return filtered(this.map(function (i, el) {
        return filter.call(children(el.parentNode), function (child) { return child !== el })
      }), selector)
    },
    empty: function () {
      return this.each(function () { this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function (property) {
      return $.map(this, function (el) { return el[property] })
    },
    show: function () {
      return this.each(function () {
        if (this.style.display == "none" && (this.style.display = ''))
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function (newContent) {
      return this.before(newContent).remove()
    },
    wrap: function (structure) {
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom = $(structure).get(0),
          clone = dom.parentNode || this.length > 1

      return this.each(function (index) {
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function (structure) {
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function (structure) {
      var func = isFunction(structure)
      return this.each(function (index) {
        var self = $(this), contents = self.contents(),
          dom = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function () {
      this.parent().each(function () {
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function () {
      return this.map(function () { return this.cloneNode(true) })
    },
    hide: function () {
      return this.css("display", "none")
    },
    toggle: function (setting) {
      return this.each(function () {
        var el = $(this)
        ; (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function (selector) { return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function (selector) { return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function (html) {
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function (idx) {
          var originHtml = this.innerHTML
          $(this).empty().append(funcArg(this, html, idx, originHtml))
        })
    },
    text: function (text) {
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function () { this.textContent = (text === undefined) ? '' : '' + text })
    },
    attr: function (name, value) {
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
            (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
              (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function (idx) {
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function (name) {
      return this.each(function () { this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function (name, value) {
      name = propMap[name] || name
      return (value === undefined) ?
        (this[0] && this[0][name]) :
        this.each(function (idx) {
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function (name, value) {
      var data = this.attr('data-' + name.replace(capitalRE, '-$1').toLowerCase(), value)
      return data !== null ? deserializeValue(data) : undefined
    },
    val: function (value) {
      return arguments.length === 0 ?
        (this[0] && (this[0].multiple ?
            $(this[0]).find('option').filter(function () { return this.selected }).pluck('value') :
            this[0].value)
        ) :
        this.each(function (idx) {
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function (coordinates) {
      if (coordinates) return this.each(function (index) {
        var $this = $(this),
          coords = funcArg(this, coordinates, index, $this.offset()),
          parentOffset = $this.offsetParent().offset(),
          props = {
            top: coords.top - parentOffset.top,
            left: coords.left - parentOffset.left
          }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (this.length == 0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function (property, value) {
      if (arguments.length < 2) {
        var element = this[0], computedStyle = ''
        if (!element) return
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property : [property], function (_, prop) {
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function () { this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function () { this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function () { this.style.cssText += ';' + css })
    },
    index: function (element) {
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function (name) {
      if (!name) return false
      return emptyArray.some.call(this, function (el) {
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function (name) {
      if (!name) return this
      return this.each(function (idx) {
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function (klass) {
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function (name) {
      return this.each(function (idx) {
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function (name, when) {
      if (!name) return this
      return this.each(function (idx) {
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function (klass) {
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function (value) {
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function () { this.scrollTop = value } :
        function () { this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function (value) {
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function () { this.scrollLeft = value } :
        function () { this.scrollTo(value, this.scrollY) })
    },
    position: function () {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top -= parseFloat($(elem).css('margin-top')) || 0
      offset.left -= parseFloat($(elem).css('margin-left')) || 0

      // Add offsetParent borders
      parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0
      parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0

      // Subtract the two offsets
      return {
        top: offset.top - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function () {
      return this.map(function () {
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function (dimension) {
    var dimensionProperty =
      dimension.replace(/./, function (m) { return m[0].toUpperCase() })

    $.fn[dimension] = function (value) {
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
          (offset = this.offset()) && offset[dimension]
      else return this.each(function (idx) {
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function (operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function () {
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function (arg) {
          argType = type(arg)
          return argType == "object" || argType == "array" || arg == null ?
            arg : zepto.fragment(arg)
        }),
        parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function (_, target) {
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
          operatorIndex == 1 ? target.firstChild :
            operatorIndex == 2 ? target :
              null

        nodes.forEach(function (node) {
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          traverseNode(parent.insertBefore(node, target), function (el) {
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
              (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

; (function ($) {
  var $$ = $.zepto.qsa, _zid = 1, undefined,
    slice = Array.prototype.slice,
    isFunction = $.isFunction,
    isString = function (obj) { return typeof obj == 'string' },
    handlers = {},
    specialEvents = {},
    focusinSupported = 'onfocusin' in window,
    focus = { focus: 'focusin', blur: 'focusout' },
    hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function (handler) {
      return handler
        && (!event.e || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return { e: parts[0], ns: parts.slice(1).sort().join(' ') }
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture) {
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function (event) {
      if (event == 'ready') return $(document).ready(fn)
      var handler = parse(event)
      handler.fn = fn
      handler.sel = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function (e) {
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del = delegator
      var callback = delegator || fn
      handler.proxy = function (e) {
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture) {
    var id = zid(element)
    ; (events || '').split(/\s/).forEach(function (event) {
      findHandlers(element, event, fn, selector).forEach(function (handler) {
        delete handlers[id][handler.i]
        if ('removeEventListener' in element)
          element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function (fn, context) {
    if (isFunction(fn)) {
      var proxyFn = function () { return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function (event, data, callback) {
    return this.on(event, data, callback)
  }
  $.fn.unbind = function (event, callback) {
    return this.off(event, callback)
  }
  $.fn.one = function (event, selector, data, callback) {
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function () { return true },
    returnFalse = function () { return false },
    ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
    eventMethods = {
      preventDefault: 'isDefaultPrevented',
      stopImmediatePropagation: 'isImmediatePropagationStopped',
      stopPropagation: 'isPropagationStopped'
    }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function (name, predicate) {
        var sourceMethod = source[name]
        event[name] = function () {
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
        'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function (selector, event, callback) {
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function (selector, event, callback) {
    return this.off(event, selector, callback)
  }

  $.fn.live = function (event, callback) {
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function (event, callback) {
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function (event, selector, data, callback, one) {
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function (type, fn) {
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function (_, element) {
      if (one) autoRemove = function (e) {
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function (e) {
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), { currentTarget: match, liveFired: element })
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function (event, selector, callback) {
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function (type, fn) {
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function () {
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function (event, args) {
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function () {
      // items in the collection might not be DOM elements
      if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function (event, args) {
    var e, result
    this.each(function (i, element) {
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function (i, handler) {
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ; ('focusin focusout load resize scroll unload click dblclick ' +
    'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
    'change select keydown keypress keyup error').split(' ').forEach(function (event) {
    $.fn[event] = function (callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function (name) {
    $.fn[name] = function (callback) {
      if (callback) this.bind(name, callback)
      else this.each(function () {
        try { this[name]() }
        catch (e) { }
      })
      return this
    }
  })

  $.Event = function (type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

; (function ($) {
  var jsonpID = 0,
    document = window.document,
    key,
    name,
    rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    scriptTypeRE = /^(?:text|application)\/javascript/i,
    xmlTypeRE = /^(?:text|application)\/xml/i,
    jsonType = 'application/json',
    htmlType = 'text/html',
    blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
      triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() { }

  $.ajaxJSONP = function (options, deferred) {
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function (errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function (e, errorType) {
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function () {
      responseData = arguments
    }

    script.src = options.url.replace(/=\?/, '=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function () {
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json: jsonType,
      xml: 'application/xml, text/xml',
      html: htmlType,
      text: 'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && (mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
        scriptTypeRE.test(mime) ? 'script' :
          xmlTypeRE.test(mime) && 'xml') || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function (options) {
    var settings = $.extend({}, options || {}),
      deferred = $.Deferred && $.Deferred()
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)
    if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

    var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
      headers = {},
      setHeader = function (name, value) { headers[name.toLowerCase()] = [name, value] },
      protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
      xhr = settings.xhr(),
      nativeSetHeader = xhr.setRequestHeader,
      abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script') (1, eval)(result)
            else if (dataType == 'xml') result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function () {
      xhr.onreadystatechange = empty
      xhr.abort()
      ajaxError(null, 'timeout', xhr, settings, deferred)
    }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    var hasData = !$.isFunction(data)
    return {
      url: url,
      data: hasData ? data : undefined,
      success: !hasData ? data : $.isFunction(success) ? success : undefined,
      dataType: hasData ? dataType || success : success
    }
  }

  $.get = function (url, data, success, dataType) {
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function (url, data, success, dataType) {
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function (url, data, success) {
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function (url, data, success) {
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
      options = parseArguments(url, data, success),
      callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function (response) {
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope) {
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function (key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function (obj, traditional) {
    var params = []
    params.add = function (k, v) { this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

; (function ($) {
  $.fn.serializeArray = function () {
    var result = [], el
    $([].slice.call(this.get(0).elements)).each(function () {
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function () {
    var result = []
    this.serializeArray().forEach(function (elm) {
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function (callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

; (function ($) {
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function (dom, selector) {
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function (object) {
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

})(Zepto)


// /var/www/famobi/release-v2/laravel-fe/public/assets/js/plugins/zepto-plugins.js

// see https://github.com/blai/fashionista/issues/2
; (function ($) {
  $.getScript = function (src, func) {
    var script = document.createElement('script');
    script.async = "async";
    script.src = src;
    if (func) {
      script.onload = func;
    }
    document.getElementsByTagName("head")[0].appendChild(script);
  }
})(Zepto);

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/overrides.js


// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/ads.js

fg_api.prototype.adsModule = function () {
  var self = this,
    M;

  function module() { }

  module.prototype.init = function () {
    M.timeoutActive = null;

    self.config.ads = window.Zepto.extend(self.config.ads || {}, {
      "off": (self.config.gameParams.ad_type === "off"),
      "show_initial": !self.hasFeature("highscores") && (self.config.gameParams.ad_type === "timed" || self.config.gameParams.ad_type === "initial"),
      "show_timed": self.config.gameParams.ad_type === "timed",
      "show_timed_ms": 120000
    });

    // For Google AdSense Review
    if (self.getUrlParams()['google_adsense'] && self.getUrlParams()['google_adsense'] === '1') {
      self.config.features["ads"] = 1;
      self.config.ads.off = false;
    }

    if (self.config.ads.off) {
      return;
    }
  };

  module.prototype.resizeAdContainer = function (width, height) {
    if (width || height) {
      M.adContainer.style.height = height;
    }
  };

  module.prototype.showAd = function (callback) {
    if (window.top !== window.self) {
      self.log("ads disabled in <iframe>");
      return false;
    }
    return M.showAdsense(callback);
  };

  module.prototype.showAdsense = function (callback) {
    if (self.adapters.run("ads", "show", callback)) {
      return false;
    }

    if (!M.initAdModal({ "returnCallback": callback })) {
      return false;
    }

    // @see https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/quickstart

    var adContainerElement = M.adContainerElement = document.createElement('div');
    adContainerElement.id = 'fg-ad-container';
    // adContainerElement.style.position = 'absolute';
    adContainerElement.style.overflow = 'hidden';
    self.rootElement.appendChild(adContainerElement);
    var adDisplayContainer = M.adDisplayContainer = new google.ima.AdDisplayContainer(adContainerElement);

    adDisplayContainer.initialize();
    M.adsLoader = new google.ima.AdsLoader(adDisplayContainer);

    M.showAdModal({ "returnCallback": callback });

    module.prototype.onAdsManagerLoaded = function (adsManagerLoadedEvent) {
      self.log("adsManagerLoadedEvent", adsManagerLoadedEvent);

      // Get the ads manager.
      M.adsManager = adsManagerLoadedEvent.getAdsManager({ "duration": 0, "currentTime": 0 });

      M.adsManager.init(300, 250, google.ima.ViewMode.NORMAL);
      M.adsManager.start();

      // Listen to any additional events, if necessary.
      window.Zepto.each(['LOADED', 'IMPRESSION', 'USER_CLOSE', 'SKIPPED', 'COMPLETE', 'ALL_ADS_COMPLETED'], function (key, value) {
        M.adsManager.addEventListener(google.ima.AdEvent.Type[value], M.onAdEvent);
      });
    };

    module.prototype.onAdEvent = function (adEvent) {
      var ad = adEvent.getAd();
      self.log("adEvent", adEvent);
      self.log("Ad", ad);
      self.log("Ad.isLinear()", ad.isLinear());
      self.log("width", ad.getWidth());
      self.log("height", ad.getHeight());
      self.log("duration", ad.getDuration());
      self.log(adEvent.type);

      self.tracking.trackEvent("Ad event", "AdSense", adEvent.type);
      switch (adEvent.type) {
        case google.ima.AdEvent.Type.LOADED:

          if (!ad.isLinear() && ad.getWidth()) {
            self.modal.setDimensions(ad.getWidth(), ad.getHeight());
          }
          break;
        case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
        case google.ima.AdEvent.Type.COMPLETE:
        case google.ima.AdEvent.Type.SKIPPED:
        case google.ima.AdEvent.Type.USER_CLOSE:
          self.modal.close();

          if (M.adsLoader)
            M.adsLoader.destroy();
          if (M.adDisplayContainer)
            M.adDisplayContainer.destroy();
          if (M.adsManager)
            M.adsManager.destroy();
          break;
      }
    };

    module.prototype.onAdError = function (adErrorEvent) {
      self.log(adErrorEvent, adErrorEvent.getError());
      // M.adsManager.destroy();
    };

    module.prototype.remainingTimeChangedHandler = function (event) {
      self.log("remainingTime", M.adsManager.remainingTime);
    };

    // Add event listeners
    M.adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      M.onAdsManagerLoaded,
      false);
    M.adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      M.onAdError,
      false);
    M.adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.REMAINING_TIME_CHANGED,
      M.remainingTimeChangedHandler,
      false);

    google.ima.AdsRenderingSettings.AUTO_SCALE = true;
    google.ima.AdsRenderingSettings.autoAlign = true;
    google.ima.AdsRenderingSettings.useStyledNonLinearAds = true;

    var adsRequest = new google.ima.AdsRequest();
    adsRequest.disableCompanionAds = true;
    var myadTagUrl = "";
    /*
    Here is a test AFG pub ID you can use so we can review: ca-games-pub-4968145218643279.
    Once we have a live implementation with this pub ID we can then create one for the a/c pub-8700401253704627.
    */
    var publisherId = "ca-games-pub-8700401253704627";
    var descriptionUrl = encodeURIComponent("http://html5games.com/Game/-/" + self.config.uuid);
    var age = "";
    var gender = "";
    var adtest = self.debug ? "on" : "";
    var channel = self.config.ads.adsense_channels.join('+');
    var adType = "image"; //video_text_image_flash
    var duration = 40000;
    var language = self.gametranslation.getUserLang();
    var slotname = "";

    if (myadTagUrl == "") {
      // @see https://support.google.com/adsense/answer/3112148?hl=en
      myadTagUrl = "http://googleads.g.doubleclick.net/pagead/ads?client=" + publisherId + "&videoad_start_delay=0&overlay=0";
      if (adType != "") {
        myadTagUrl = myadTagUrl + ("&ad_type=" + adType);
      }
      if (duration != "") {
        myadTagUrl = myadTagUrl + ("&max_ad_duration=" + duration);
      }
      else {
        myadTagUrl = myadTagUrl + "&max_ad_duration=100000";
      }
      if (age != null) {
        myadTagUrl = myadTagUrl + ("&cust_age=" + age);
      }
      if (gender != "") {
        myadTagUrl = myadTagUrl + ("&cust_gender=" + gender);
      }
      if (adtest != "") {
        myadTagUrl = myadTagUrl + ("&adtest=" + adtest);
      }
      if (language != "") {
        myadTagUrl = myadTagUrl + ("&hl=" + language);
      }
      if (slotname != "") {
        myadTagUrl = myadTagUrl + ("&slotname=" + slotname);
      }
      if (channel != "") {
        myadTagUrl = myadTagUrl + ("&channel=" + channel);
      }
      if (descriptionUrl != "") {
        myadTagUrl = myadTagUrl + ("&description_url=" + descriptionUrl);
      }
    }

    // adsRequest.adTagUrl = "http://pubads.g.doubleclick.net/gampad/ads?sz=640x360&iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=[referrer_url]&correlator=[timestamp]";
    // adsRequest.adTagUrl = "http://googleads.g.doubleclick.net/pagead/ads?ad_type=image&client=ca-games-pub-4968145218643279&description_url=http%3A%2F%2Fhtml5games.com%2FGame%2F-%2Fd8f24956-dc91-4902-9096-a46cb1353b6f";

    adsRequest.adTagUrl = myadTagUrl;

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    // var c = window.getComputedStyle(self.bodyElement, null);
    // self.log("getComputedStyle", {"w": c.w, "h": c.h});
    adsRequest.linearAdSlotWidth = 640;
    adsRequest.linearAdSlotHeight = 400;

    adsRequest.nonLinearAdSlotWidth = 300;
    adsRequest.nonLinearAdSlotHeight = 250;

    M.adsLoader.requestAds(adsRequest);
  };

  module.prototype.showTimed = function (ms) {
    function startTimer() {
      setTimeout(function () {
        startTimer();
        M.showAd();
      }, ms);
    }
    startTimer();
  };

  module.prototype.show = function (width, height, options) {
    var opts = window.Zepto.extend({
      mode: "ad",
      showCloseBtn: true,
      format: width + "x" + height, // e.g. "200x200"
      min_s_between: (+self.config.ads.min_s_between > 0) ? +self.config.ads.min_s_between : 30000,
      returnCallback: function () { }
    }, options);

    if (!self.hasFeature("ads") || self.config.ads.off) {
      self.log("ads disabled");
      opts.returnCallback();
      return false;
    }

    self.log(M.timeoutActive);
    if (M.timeoutActive) {
      self.log("skipped ad");
      opts.returnCallback();
      return false;
    }

    // disable all Ads for X seconds
    self.log(opts.min_s_between);
    M.timeoutActive = true;
    setTimeout(function () {
      M.timeoutActive = false;
    }, opts.min_s_between * 1000);

    // show iframe with custom dimensions
    var url = "/ads/ingame?uuid=" + self.config.uuid + "&pid=" + self.config.pid + "&format=" + opts.format;
    opts.width = width;
    opts.height = height;
    self.iframe.show(url, opts);
    self.modal.setHeader(self.translate("api.ad_modal_header"));
    self.modal.setCloseCallback(opts.returnCallback);
    self.modal.updateCloseBtn(true);

    return self;
  };

  module.prototype.initAdModal = function (options) {
    var opts = window.Zepto.extend({
      returnCallback: function () { }
    }, options);

    if (M.delayNextAdModal()) {
      opts.returnCallback();
      return false;
    }

    return true;
  };

  module.prototype.showAdModal = function (options) {
    var opts = window.Zepto.extend({
      mode: "ad",
      showCloseBtn: true,
      returnCallback: function () { }
    }, options);

    M.delayNextAdModal(true);

    opts.width = 300;
    opts.height = -1;

    self.modal.create(opts);
    self.modal.setHeader(self.translate("api.ad_modal_header"));
    self.modal.updateCloseBtn(true);
    self.modal.setCloseBtnTimer(15);
    self.modal.setDimensions(opts.width, opts.height);
    self.modal.setContent(M.adContainerElement);
    self.modal.setCloseCallback(opts.returnCallback);

    return self;
  };

  module.prototype.delayNextAdModal = function (isSetter) {
    // check if Ads are enabled
    if (!self.hasFeature("ads") || self.config.ads.off) {
      self.log("ads disabled");
      return true;
    }

    self.log(M.timeoutActive);
    if (M.timeoutActive) {
      self.log("skipped ad");
      return true;
    }

    // disable all Ads for X seconds
    if (isSetter) {
      var min_s_between = (+self.config.ads.min_s_between > 0) ? +self.config.ads.min_s_between : 30000;

      self.log(min_s_between);
      M.timeoutActive = true;
      setTimeout(function () {
        M.timeoutActive = false;
      }, min_s_between * 1000);
    }

    return false;
  };

  module.prototype.isAdvertisingActive = function () {
  };

  M = new module();
  M.init();

  return M;
};

// show ad programmatically
fg_api.prototype.showAd = function (callback) {
  this.ads.showAd(callback);
};

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/adapters.js

fg_api.prototype.adaptersModule = function () {
  var self = this,
    M;

  function module() { // define private vars
    this.adapters = {
      ads: {
        show: undefined
      },
      highscore: {
        show: undefined,
        submit: undefined
      }
    };
    this.adapter_templates = {
      ads: {
        show: function (callback) { /**/ }
      },
      highscore: {
        show: function (level) { /**/ },
        submit: function (level, score) { /**/ }
      }
    };
  }

  var adaptersPrototype = module.prototype;

  adaptersPrototype.init = function () {
    var section = "",
      subsection = "";
    if (typeof famobi_adapters !== "undefined") {
      for (section in famobi_adapters) {
        self.log(section);
        for (subsection in famobi_adapters[section]) {
          self.log(subsection);
          this.add(section, subsection, famobi_adapters[section][subsection]);
        }
      }
    }
  };

  adaptersPrototype.list = function () {
    self.log("available adapters: ", this.adapters);
    self.log("adapter templates: ", this.adapter_templates);
  };

  adaptersPrototype.add = function (section, subsection, callback) {
    self.log("adding adapter: ", section + "." + subsection, callback);
    if (section in this.adapters && subsection in this.adapters[section] && callback) {
      this.adapters[section][subsection] = callback;
    } else {
      self.log("adapters.add: invalid (sub-)section or missing callback");
    }
    return this;
  };

  adaptersPrototype.has = function (section, subsection) {
    if (this.adapters[section] && this.adapters[section][subsection]) {
      return typeof this.adapters[section][subsection] === "function";
    }
    return false;
  };

  adaptersPrototype.run = function (section, subsection) {
    var args = arguments ? Array.prototype.slice.call(arguments, 2) : [];
    if (this.has(section, subsection)) {
      self.log("args", args);
      this.adapters[section][subsection].apply(this, args);
      return true;
    }
    // self.log("adapters.run: invalid (sub-)section or missing callback");
    return false;
  };

  M = new module();
  M.init();

  return M;
};

!function (a, b) {
  var famobi_analytics = {
    'stats': {}, // params for achivements etc. - custom key-value pairs
    'events': [], // list of logged events, for debugging purposes
    'currentScreen': '',
    'pageTitle': '',

    // STATS
    'trackStats': function (key, value) {
      return new Promise(function (resolve, reject) {
        var res = {};
        var values = {};

        if (typeof key === 'string') {
          values[key] = value;
        }

        var statsValidator = function () {
          for (var k in values) {
            var testKey = (typeof key === 'string' && key.length && key.length <= 42) && key.match(/^[a-z\_0-9]+$/);
            if (!testKey) {
              console.warn("trackStats(): key '" + key + "' contains not only lowercase letters, numbers and underscore ([a-z_0-9]), maximum length: 42 characters");
              return false;
            }
          }

          return true;
        }

        var isValid = statsValidator();

        if (!isValid) {
          reject("trackStats(): invalid params " + JSON.stringify(key, value));
          return false;
        }

        var updateKey = function (key, value) {
          if (typeof key === 'string' && key.length) {
            if (key in famobi_analytics.stats &&
              (typeof value === "undefined" || value === null)) {
              delete famobi_analytics.stats[key];
            } else {
              if (typeof value !== "undefined" && value) {
                famobi_analytics.stats[key] = value;
              }
            }

            return true;
          } else {
            throw ("trackStats(): key is not a string or an Object");
          }
        }

        if (key && typeof key === 'object') {
          for (var k in key) {
            value = key[k]
            updateKey(k, value);
          }

          res = key;
        } else {
          updateKey(key, value);

          res[key] = value;
        }

        if (famobi.hasOwnProperty("adapters")) {
          famobi.adapters.run("analytics", "trackStats", key, value);
        }

        resolve(res);
      });
    },
    'getStats': function () {
      // for debugging purposes
      return new Promise(function (resolve, reject) {
        resolve(famobi_analytics.stats);
      });
    },

    // EVENTS
    'trackEvent': function (event, params) {
      return new Promise(function (resolve, reject) {
        if (typeof famobi_analytics[event] === "undefined") {
          reject('trackEvent(): unknown event \'' + event + '\'');
          return false;
        }

        params = params || {};

        if (typeof params !== "object" && params !== null) {
          reject('trackEvent(): second parameter needs to be an object');
          return false;
        }

        var paramsValidator = function () {
          var availableParams = {
            'levelName': '',
            'reason': [
              'timeout',
              'dead',
              'wrong_answer',
              'quit',
              'draw'
            ],
            'levelScore': -0.0,
            'liveScore': -0.0,
            'totalScore': -0.0,
            'bgmVolume': 0.0,
            'sfxVolume': 0.0
          };
          var requiredParams = {
            'EVENT_LEVELFAIL': ['levelName', 'reason'],
            'EVENT_LEVELRESTART': ['levelName'],
            'EVENT_LEVELSTART': ['levelName'],
            'EVENT_LEVELSUCCESS': ['levelName'],
            'EVENT_LEVELSCORE': ['levelName', 'levelScore'],
            'EVENT_LIVESCORE': ['liveScore'],
            'EVENT_TOTALSCORE': ['totalScore'],
            'EVENT_VOLUMECHANGE': ['bgmVolume', 'sfxVolume'],
            'EVENT_CUSTOM': []
          };

          if (typeof requiredParams[event] !== "undefined" && Object.keys(params).length === 0) {
            console.warn("trackEvent(): '" + event + "' requires at least one parameter");
            return false;
          }

          if (typeof requiredParams[event] === "undefined") {
            return true;
          }

          var k = 0;
          var name = '';
          var param = null;

          for (k; k < requiredParams[event].length; k++) {
            name = requiredParams[event][k];
            param = availableParams[name];

            if (typeof param === "string") {
              if (typeof params[name] !== "string") {
                console.warn("trackEvent(): required param '" + name + "' has to be of type string");
                return false;
              }
            }

            if (typeof param === "number") {
              if (typeof params[name] !== "number") {
                console.warn("trackEvent(): required param '" + name + "' has to be of type number");
                return false;
              }
            }

            if (typeof param === "object") {
              if (param.indexOf(params[name]) === -1) {
                console.warn("trackEvent(): required param '" + name + "' has to be one of \"" + param.join('", "') + "\"");
                return false;
              }
            }
          }

          return true;
        }

        var isValid = paramsValidator();

        if (!isValid) {
          return reject("trackEvent(): invalid params " + JSON.stringify(params));
        }

        famobi_analytics.events.push({ event: event, params: params });

        if (famobi.hasOwnProperty("adapters")) {
          famobi.adapters.run("analytics", "trackEvent", event, params);
        }

        if (famobi_analytics.TRIGGER_AD.indexOf(event) > -1) {
          // return famobi.showAd(function () {
          //   resolve(event, params);
          // });
        }

        if (famobi_analytics.TRIGGER_LEVELSCORE.indexOf(event) > -1) {
          // famobi.submitHighscore(params['levelName'], params['levelScore']);
          // return resolve(event, params);
        }

        if (famobi_analytics.TRIGGER_TOTALSCORE.indexOf(event) > -1) {
          // famobi.submitHighscore('TOTAL', params['totalScore']);
          // return resolve(event, params);
        }

        if (famobi_analytics.TRIGGER_LIVESCORE.indexOf(event) > -1) {
          // window.fg_api.__proto__.sendLiveScore(params['liveScore']);
          // return resolve(event, params);
        }

        return resolve(event, params);
      });
    },
    'getEvents': function () {
      // for debugging purposes
      return new Promise(function (resolve, reject) {
        resolve(famobi_analytics.events);
      });
    },

    EVENT_CUSTOM: 'EVENT_CUSTOM',
    EVENT_LEVELFAIL: 'EVENT_LEVELFAIL',
    EVENT_LEVELRESTART: 'EVENT_LEVELRESTART',
    EVENT_LEVELSTART: 'EVENT_LEVELSTART',
    EVENT_LEVELSUCCESS: 'EVENT_LEVELSUCCESS',
    EVENT_LIVESCORE: 'EVENT_LIVESCORE',
    EVENT_LEVELSCORE: 'EVENT_LEVELSCORE',
    EVENT_TOTALSCORE: 'EVENT_TOTALSCORE',
    EVENT_TUTORIALCOMPLETED: 'EVENT_TUTORIALCOMPLETED',
    EVENT_TUTORIALSKIPPED: 'EVENT_TUTORIALSKIPPED',
    EVENT_VOLUMECHANGE: 'EVENT_VOLUMECHANGE',

    // SCREEN
    'trackScreen': function (screen, pageTitle) {
      return new Promise(function (resolve, reject) {
        var requiredPageTitleScreens = [
          'SCREEN_OTHER'
        ];

        if (typeof famobi_analytics[screen] === "undefined") {
          reject("trackScreen(): unknown screen '" + screen + "'");
          return false;
        }

        if (!pageTitle && screen.indexOf(requiredPageTitleScreens) > -1) {
          reject("trackScreen(): screen '" + screen + "' requires param 'pageTitle'");
          return false;
        }

        if (pageTitle && typeof pageTitle !== "string") {
          reject("trackScreen(): required param 'pageTitle' has to be a non-empty string");
          return false;
        }

        famobi_analytics.currentScreen = screen;
        famobi_analytics.pageTitle = pageTitle;

        if (famobi.hasOwnProperty("adapters")) {
          famobi.adapters.run("analytics", "trackScreen", screen, pageTitle);
        }
        resolve(screen, pageTitle);
      });
    },
    'getScreen': function () {
      return famobi_analytics.currentScreen;
    },
    'getPageTitle': function () {
      return famobi_analytics.pageTitle;
    },

    SCREEN_OTHER: 'SCREEN_OTHER', // custom, use pageTitle to differentiate
    SCREEN_BONUS: 'SCREEN_BONUS', // bonus screen, e.g. extra chance
    SCREEN_CHARACTER: 'SCREEN_CHARACTER', // Select character
    SCREEN_CREDITS: 'SCREEN_CREDITS', // credits screen, if used
    SCREEN_GAMERESULT: 'SCREEN_GAMERESULT', // result screen with total score (game over)
    SCREEN_HELP: 'SCREEN_HELP', // help screen
    SCREEN_HOME: 'SCREEN_HOME', // home screen (start screen)
    SCREEN_LEVEL: 'SCREEN_LEVEL', // level screen while playing
    SCREEN_LEVELINTRO: 'SCREEN_LEVELINTRO', // level has not yet begun (optional)
    SCREEN_LEVELLOADING: 'SCREEN_LEVELLOADING', // level is loading (optional)
    SCREEN_LEVELRESULT: 'SCREEN_LEVELRESULT', // result screen with level score
    SCREEN_LEVELSELECT: 'SCREEN_LEVELSELECT', // level select screen
    SCREEN_PAUSE: 'SCREEN_PAUSE', // pause screen
    SCREEN_SETTINGS: 'SCREEN_SETTINGS', // settings screen (advanced game settings)
    SCREEN_SHOP: 'SCREEN_SHOP', // when the game features an ingame shop, use pageTitle to differentiate between items
    SCREEN_SPLASH: 'SCREEN_SPLASH', // splash screen, if used
    SCREEN_TUTORIAL: 'SCREEN_TUTORIAL', // tutorial screen(s), use pageTitle to differentiate between multiple tutorial screens

    TRIGGER_AD: ['EVENT_LEVELSUCCESS', 'EVENT_LEVELFAIL'],
    TRIGGER_LEVELSCORE: ['EVENT_LEVELSCORE'],
    TRIGGER_LIVESCORE: ['EVENT_LIVESCORE'],
    TRIGGER_TOTALSCORE: ['EVENT_TOTALSCORE']
  };

  // export famobi_analytics object to global object
  b[a] = famobi_analytics;

}('famobi_analytics', window);


// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/audio.js

/* http://updates.html5rocks.com/2014/07/Web-Audio-Changes-in-m36 */
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/base.js



function fg_api(config, queue) {
  config = config || {};
  queue = queue || [];
  var i = 0, j = queue.length, self = this;
  self.config = config;
  self.debug = false;
  window.Zepto(function () {
    self.init();
    while (i < j) {
      window.fg_api.__proto__.push(queue[i++]);
    }
  });
}

/**
 * Log function
 */
fg_api.prototype.log = function () {
  if (this.debug && window.console) {
    console.log.apply(console, arguments);
  }
};

window.Zepto.fn.preventClick = function () {
  this.each(function () {
    window.Zepto(this).on("click touchstart touchmove touchcancel touchend", function (e) {
      e.stopPropagation();
      return false;
    });
  });

  return this;
};

fg_api.prototype.hasFeature = function (feature) {
  return true;
};

fg_api.prototype.createElement = function (type, attributes) {
  var element = document.createElement(type);
  for (var key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      element.setAttribute(key, attributes[key]);
    }
  }
  return element;
};

fg_api.prototype.handleClick = function (element, callback) {
  //var events = ["click", "touchstart", "touchend", "touchmove", "touchcancel"];

  if (typeof callback == 'function') {
    element.addEventListener(detection.is.pc ? "click" : "touchstart", function (e) {
      callback.call(this, e);
      e.cancelBubble = true;
      e.stopPropagation();
      return false;
    });
  }

  /*for(var x in events){
    element.addEventListener(events[x], function(e){
      e.cancelBubble = true;
      e.stopPropagation();
      return false;
    });
  }*/

  return element;
};

fg_api.prototype.getUrlParams = function (a, b, c) {
  a = /[?&]?([^=]+)=([^&]*)/g, b = document.location && document.location.search ? document.location.search.split("+").join(" ") : "";
  for (var d = {}; c = a.exec(b);) d[decodeURIComponent(c[1])] = decodeURIComponent(c[2]);
  return d;
};

fg_api.prototype.getShortLink = function () {
  return this.config.short_url;
};

if (!window.console) {
  console = {
    log: function () { },
    debug: function () { },
    info: function () { },
    warn: function () { }
  };
}

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/branding.js

fg_api.prototype.getMoreGamesButtonImage = function () {
  return window.famobi.__("more_games_image");
};

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/storage.js

fg_api.prototype.storageModule = function () {
  var self = this,
    M;

  function module() { // define private vars

  }

  var storagePrototype = module.prototype;

  storagePrototype.init = function () {
    M.listen();
    self.callbacks = {};

    // Create a storage proxy (same api like local-/sessionStorage) with double the data!
    function createProxyStorage(storageType) {
        return {
            data: {},
            getItem: function (key, ns) {
                key = getNamespacedKey(key, ns);
                return window[storageType].getItem(key);
            },
            getProxyItem: function (key, ns) {
                key = getNamespacedKey(key, ns);
                return this.data[key];
            },
            setItem: function (key, value, ns) {
                key = getNamespacedKey(key, ns);
                this.data[key] = value;
                this.updateLength();
                window[storageType].setItem(key, value);
            },
            removeItem: function (key, ns) {
                key = getNamespacedKey(key, ns);
                try {
                    delete this.data[key];
                } catch (e) {
                }
                this.updateLength();
                window[storageType].removeItem(key);
            },
            clear: function () {
                for (var key in window[storageType]) {
                    if(key.indexOf(window.famobi_gameID) === 0) this.removeItem(key, "");
                }
            },
            key: function (i) {
                var keys = [];
                for (var key in window[storageType]) {
                    if(key.indexOf(window.famobi_gameID) === 0) keys.push(key);
                }
                return typeof keys[i] === "undefined" ? null : keys[i];
            },
            updateLength: function(){
                M.length = self.sizeOf(this.data);
            },
            getKeys: function(){
                var keys = [];
                for (var key in window[storageType]) {
                    if(key.indexOf(window.famobi_gameID) === 0) keys.push(key);
                }
                return keys;
            }
        };
    }

    // Create a storage stub (same api like local-/sessionStorage)
    function createFallbackStorage(storageType) {
        return {
            data: {},
            getItem: function (key, ns) {
                key = getNamespacedKey(key, ns);
                return this.data[key];
            },
            setItem: function (key, value, ns) {
                key = getNamespacedKey(key, ns);
                this.data[key] = value;
                this.updateLength();
            },
            removeItem: function (key, ns) {
                key = getNamespacedKey(key, ns);
                try {
                    delete this.data[key];
                } catch (e) {
                }
                this.updateLength();
            },
            clear: function (ns) {
                for (var key in this.data) {
                    if(key.indexOf(window.famobi_gameID) === 0) this.removeItem(key, "");
                }
            },
            key: function (i) {
                var keys = [];
                for (var key in this.data) {
                    if(key.indexOf(window.famobi_gameID) === 0) keys.push(key);
                }
                return typeof keys[i] === "undefined" ? null : keys[i];
            },
            updateLength: function(){
                M.length = self.sizeOf(this.data);
            },
            getKeys: function(){
                var keys = [];
                for (var key in this.data) {
                    keys.push(key);
                }
                return keys;
            }
        };
    }

    storagePrototype.getStorage = function() {
        return M.storage;
    };

    storagePrototype.getItem = function(key, ns) {
        var value = M.getStorage().getItem(key, ns);
        return value;
    };

    storagePrototype.setItem = function(key, value, ns) {

        if(!M.receivingData && window.top != window.self) {
            window.top.postMessage({
                scope: 'famobi_sdk',
                method: 'setItem',
                package_id: window.famobi_gameID,
                aid: self.config.aid,
                data: {
                    key: getNamespacedKey(key, ns),
                    value: value
                }
            }, "*");
        }

        return M.getStorage().setItem(key, value, ns);
    };

    storagePrototype.setMaxItem = function(key, value, ns) {
        var old_value = parseInt(M.getStorage().getItem(key, ns), 10);

        if(!old_value || parseInt(value, 10) > old_value) {
            M.getStorage().setItem(key, value, ns);
            return true;
        } else {
            return false;
        }
    };

    storagePrototype.removeItem = function(key, ns) {
        if(window.top != window.self) {
            window.top.postMessage({
                scope: 'famobi_sdk',
                method: 'removeItem',
                package_id: window.famobi_gameID,
                aid: self.config.aid,
                data: {
                    key: getNamespacedKey(key, ns)
                }
            }, "*");
        }

        return M.getStorage().removeItem(key, ns);
    };

    storagePrototype.clear = function() {
        return M.getStorage().clear();
    };

    storagePrototype.key = function(i) {
        return M.getStorage().key(i);
    };

    storagePrototype.getKeys = function() {
        return M.getStorage().getKeys();
    };
    
    // Create fallback for window.localStorage, window.sessionStorage
    window.Zepto.each(['sessionStorage', 'localStorage'], function (key, storageType) {
      var originalStorage = window[storageType];
      if (!originalStorage) {
        window[storageType] = {
          data: {},
          getItem: function (key) {
            key = famobi_gameID + ':' + key;
            return this.data[key];
          },
          setItem: function (key, value) {
            key = famobi_gameID + ':' + key;
            this.data[key] = value;
          },
          removeItem: function (key) {
            key = famobi_gameID + ':' + key;
            try {
              delete this.data[key];
            } catch (e) { }
          },
          clear: function () {
            this.data = {};
          }
        };
      } else {
        /*window[storageType] = {
          data: {},
          getItem: function (key) {
            key = famobi_gameID + ':' + key;
            return originalStorage.getItem(key);
          },
          setItem: function (key, value) {
            key = famobi_gameID + ':' + key;
            this.data[key] = value;
            return originalStorage.setItem(key, value);
          },
          removeItem: function (key) {
            key = famobi_gameID + ':' + key;
            try {
              delete this.data[key];
            } catch (e) {}
            return originalStorage.removeItem(key);
          },
          clear: function () {
            this.data = {};
            return originalStorage.clear();
          }
        };*/
      }
    });
  };

  storagePrototype.listen = function () {
    // Use postMessage API for "secure" cross-domain message-passing
    window.addEventListener("message", M.receive, false);
  };

  storagePrototype.receive = function (e) {
    if (e.origin !== self.config.urlRoot)
      return;

    var messageObject = e.data;

    if (messageObject.type == "storage") {
      var key = messageObject.key,
        value = messageObject.value,
        timestamp = messageObject.timestamp;

      if (self.callbacks[key + ":" + timestamp]) {
        self.callbacks[key + ":" + timestamp](value);
        delete self.callbacks[key + ":" + timestamp];
      }
    }
  };

  storagePrototype.set = function (key, value, saveMethod, callback) {
    if (typeof saveMethod == "function") {
      callback = saveMethod;
      saveMethod = "";
    }

    var timestamp = +new Date();
    window.frames["fg-storage-iframe"].postMessage({
      "timestamp": timestamp,
      "saveMethod": saveMethod,
      "key": key,
      "value": value
    }, "*");

    if (typeof callback == "function")
      self.callbacks[key + ":" + timestamp] = callback;
  };

  storagePrototype.get = function (key, callback) {
    var timestamp = +new Date();
    window.frames["fg-storage-iframe"].postMessage({
      "timestamp": timestamp,
      "key": key
    }, "*");

    if (typeof callback == "function")
      self.callbacks[key + ":" + timestamp] = callback;
  };

  storagePrototype.del = function (key, callback) {
    var timestamp = +new Date();
    window.frames["fg-storage-iframe"].postMessage({
      "timestamp": timestamp,
      "key": key,
      "remove": true
    }, "*");

    if (typeof callback == "function")
      self.callbacks[key + ":" + timestamp] = callback;
  };

  //create new instace of Module
  M = new module();
  //initialize Module
  M.init();

  return M;
};

fg_api.prototype.setItem = function (key, value, callback) {
  key = this.config.uuid + ":" + key;

  this.storage.set(key, value, callback);

  return this;
};

fg_api.prototype.setMaxItem = function (key, value, callback) {
  key = this.config.uuid + ":" + key;

  this.storage.set(key, value, "max", callback);

  return this;
};

fg_api.prototype.getItem = function (key, callback) {
  key = this.config.uuid + ":" + key;

  this.storage.get(key, callback);

  return this;
};

fg_api.prototype.delItem = function (key, callback) {
  key = this.config.uuid + ":" + key;

  this.storage.del(key, callback);

  return this;
};

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/login.js

fg_api.prototype.loginModule = function () {
  var self = this,
    M;

  function module() { // define private vars

  }

  var loginPrototype = module.prototype;

  loginPrototype.init = function () {
  };

  loginPrototype.show = function () {
    self.iframe.show("/account/index?ingameMode=true", { mode: "seamless" });
  };

  loginPrototype.setLoginStatus = function (loginStatus) {
    self.config.loginStatus = loginStatus;
    return self;
  };

  loginPrototype.isLoggedIn = function () {
    return self.config.loginStatus;
  };

  //create new instace of Module
  M = new module();
  //initialize Module
  M.init();

  return M;
};

fg_api.prototype.showLoginScreen = function () {
  return this.login.show();
};

fg_api.prototype.postLogin = function () {
  this.navigation.reload();
  this.navigation.hideAll();
  this.highscores.postLogin();
};

fg_api.prototype.setLoginStatus = function (loginStatus) {
  this.login.setLoginStatus(loginStatus);
};



// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/highscores.js

var highscoresModule = function () {
  var self = this,
    M;

  function module() { // define private vars

  }

  var highscoresPrototype = module.prototype;

  highscoresPrototype.init = function () {

  };

  highscoresPrototype.submit = function (level, score) {
    level = (level.length || level > 0) ? level : "0";
    score = parseInt(score, 10);

    return self;
  };

  highscoresPrototype.sendLiveScore = function (scores, force, source) {
    M.liveScoreCallback = function () {
      source = source || '';
      if (M.liveScore === scores && !force) {
        return;
      }
      M.liveScore = scores;

      if (window.top !== window.self) {
        window.top.postMessage({
          scope: 'famobi_livescores',
          method: 'sendLiveScores',
          source: source,
          package_id: window.famobi_gameID,
          aid: self.config.aid,
          data: {
            scores: scores
          }
        }, "*");
      }
    };

    if (M.liveScore !== scores) {
      // force sending live scores when it changes
      force = true;
    }

    clearTimeout(M.liveScoreTimeout);
    if (!force) {
      M.liveScoreTimeout = setTimeout(M.liveScoreCallback, M.floodControlMs);
    } else {
      M.liveScoreCallback();
    }

    return self;

  };

  highscoresPrototype.show = function (level) {
    if (self.hasFeature("highscores")) {
      // Run Adapter if possible
      if (self.adapters.run("highscore", "show", level)) {
        return self;
      }

      // Business as usual
      self.iframe.show("/gameapi/highscore/" + self.config.uuid);
    }

    return self;
  };

  highscoresPrototype.get = function (callback) {
    self.getItem("score", callback);

    return self;
  };

  highscoresPrototype.del = function () {
    self.delItem("score");
  };

  highscoresPrototype.postLogin = function () {
    self.getItem("score", function (value) {
      window.Zepto(self.rootElement).off("fg_api.submitHighscore");
      if (value) {
        window.Zepto(self.rootElement).one("fg_api.submitHighscore", function () {
          self.showHighscore();
        });
        self.submitHighscore("", value);
      } else {
        self.welcome.init();
      }
    });
  };

  highscoresPrototype.submitHighscoreCallback = function () {
    self.highscores.del();
    window.Zepto(self.rootElement).trigger("fg_api.submitHighscore");
  };

  M = new module();
  M.init();

  return M;
};

window.highscoresModule = new highscoresModule()

fg_api.prototype.submitHighscore = function (level, score) {
  console.log(window)
  if (this.hasFeature("highscores")) {
    window.highscores.submit(level, score);
  }
};

fg_api.prototype.showHighscore = function () {
  this.highscores.show();
};

fg_api.prototype.getHighscore = function (callback) {
  this.highscores.get(callback);
};

fg_api.prototype.sendLiveScore = function (score) {
  window.highscoresModule.__proto__.sendLiveScore(score);
};

fg_api.prototype.submitHighscoreCallback = function () {
  this.highscores.submitHighscoreCallback();
};


// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/navigation.js

// fg_api.prototype.navigationModule = function() {
// 	var self = this,
// 		M;
//
// 	function module(){ // define private vars
//
// 	}
//
// 	var navigationPrototype = module.prototype;
//
// 	navigationPrototype.init = function(){
// 		self.fgNavigation = document.createElement("nav");
// 		self.fgNavigation.style.position = "relative";
// 		self.fgNavigation.setAttribute("id", "fg-navigation");
// 		window.Zepto(self.headElement).append(self.config.style);
// 		self.fgOverlay.innerHTML = self.config.headerHtml;
// 		self.fgOverlay.appendChild(self.fgNavigation);
// 		self.fgOverlay_visible = false;
// 		self.fgHeader = document.getElementById("fg-header");
//
// 		window.Zepto("#fg-clip, #fg-logo").each(function(){
// 			self.handleClick(this, toggleOverlay);
// 		});
//
// 		function toggleOverlay(e){
// 			if(self.fgOverlay_visible){
// 				M.hideAll();
// 			}else{
// 				M.show();
// 			}
// 			e.stopPropagation();
// 			return false;
// 		}
//
// 		// Init Left-Hand-Navigation
// 		if (self.hasFeature('menu')) {
// 			M.setHtml(self.config.menuHtml);
// 		}
//
// 		return self;
// 	};
//
// 	navigationPrototype.bindEvents = function() {
// 		window.Zepto("[data-switch-lang]").each(function() {
// 			var $this = window.Zepto(this),
// 				lang = window.Zepto(this).attr("data-switch-lang");
//
// 			$this.removeClass('fg-lang-selected');
//
// 			if (lang === self.gametranslation.curLangString) {
// 				$this.addClass('fg-lang-selected');
// 				$this.css('box-shadow', '1px 1px 1px #000');
// 				$this.css('cursor', 'pointer');
// 			}
//
// 			self.handleClick(this, function() {
// 				if (lang.length) {
// 					M.switchLanguage(lang);
// 				}
// 			});
// 		});
//
// 		window.Zepto("[data-famobi-href]").css("cursor", "pointer");
//
// 		window.Zepto("[data-famobi-href]").each(function() {
// 			var callback = function() {
// 				var link = window.Zepto(this).attr("data-famobi-href");
//
// 				if (link == "moreGames") {
// 					M.hideAll();
// 					return self.moreGamesLink();
// 				}
// 				if (link == "back") {
// 					M.hideAll();
// 					return self.backLink();
// 				}
// 			};
//
// 			self.handleClick(this, callback);
// 		});
// 	};
//
// 	navigationPrototype.switchLanguage = function(lang) {
// 		var params = self.getUrlParams(),
// 			qs = '';
//
// 		params.locale = lang;
// 		qs = window.Zepto.param(params);
// 		document.location.replace(document.location.pathname + "?" + qs + (document.location.hash ? "#" + document.location.hash : ""));
// 	};
//
// 	navigationPrototype.show = function() {
// 		M.hideAll();
//
// 		self.fgOverlay_visible = true;
// 		window.Zepto(self.fgOverlay).addClass("navigation-view");
// 		self.fgNavigation.style.display = "";
//
// 		return self;
// 	};
//
// 	navigationPrototype.hide = function() {
// 		self.fgOverlay_visible = false;
// 		self.fgNavigation.style.display = "none";
//
// 		return self;
// 	};
//
// 	// hide all views (navigation, iframe, maybe more) call before you want to display a new "view"
// 	navigationPrototype.hideAll = function() {
// 		$fgOverlay = window.Zepto(self.fgOverlay);
// 		$fgOverlay.removeClass("iframe-view navigation-view");
// 		M.hide(); // hide navigation
// 		self.modal.close(); // close modals
//
// 		return self;
// 	};
//
// 	navigationPrototype.reload = function(){
// 		self.comIframe.setAttribute("src", self.config.urlRoot + "/api/external/game/menu/?uuid=" + self.config.uuid);
// 	};
//
// 	navigationPrototype.setHtml = function(html){
// 		self.fgNavigation.innerHTML = html;
//
// 		M.bindEvents();
//
// 		self.gametranslation.translateHtml(window.Zepto(self.fgNavigation));
// 	};
//
// 	M = new module();
//
// 	M.init();
//
// 	return M;
// };

fg_api.prototype.backLink = function () {
  var self = this;

  if (window.opener) {
    try {
      window.opener.focus();
    } catch (ex) {
      // SecurityError
    } finally {
      window.close();
    }

    return;
  }

  if (history.length > 1) {
    return window.history.go(-1);
  }

  return self.moreGamesLink();
};

fg_api.prototype.moreGamesLink = function () {
  var moreGamesLink = window.famobi.__("more_games_url");

  if (!window.open(moreGamesLink, "")) {
    window.location.href = moreGamesLink;
  }
};
//
// fg_api.prototype.updateMenu = function(html){
// 	this.navigation.setHtml(html);
// };

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/spinner.js

fg_api.prototype.spinnerModule = function () {
  var self = this,
    M;

  function module() { // define private vars
    this.spinner = "";
  }

  var spinnerPrototype = module.prototype;

  spinnerPrototype.init = function () {
    M.spinner = self.createElement("div", { "class": "fg-spinner" });
    M.spinner.innerHTML = '<div class="fg-dot1"></div><div class="fg-dot2"></div><div class="fg-dot3"></div><div class="fg-dot4"></div><div class="fg-dot5"></div><div class="fg-dot6"></div><div class="fg-dot7"></div>';

    self.rootElement.appendChild(M.spinner);

    return this;
  };

  spinnerPrototype.show = function () {
    M.spinnerState = "new";
    M.spinner.style.visibility = "visible";
    M.spinner.style.left = "50%";
    M.spinner.style.opacity = 1;

    setTimeout(function () {
      if (M.spinnerState == "tryhide") {
        M.spinnerState = "closeable";
        M.hide();
      } else {
        M.spinnerState = "closeable";
      }
    }, 1000);

    //show spinner max 15sec
    setTimeout(function () {
      M.hide();
    }, 15000);

    return this;
  };

  spinnerPrototype.hide = function () {
    if (M.spinnerState && M.spinnerState == "closeable") {
      M.spinner.style.opacity = 0;
      setTimeout(function () {
        M.spinner.style.visibility = "hidden";
        M.spinner.style.left = "-80px";
      }, 1000);
    } else {
      M.spinnerState = "tryhide";
    }
    return this;
  };

  M = new module();
  M.init();

  return M;
};

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/modal.js

fg_api.prototype.modalModule = function () {
  var self = this,
    M;

  function module() { // define private vars
    this.element = "";
    this.closeCallbacks = [];
  }

  var modalPrototype = module.prototype;

  modalPrototype.init = function () {
    M.listen();
  };

  modalPrototype.create = function (options) {
    var opts = window.Zepto.extend({
      showCloseBtn: true
    }, options);

    M.close(); // close all other window - it's a MODAL

    var className = "";
    if (opts.mode) {
      className = opts.mode + "-mode";
    }

    M.element = self.createElement('div', { 'class': 'fg-modal fg-fade fg-show ' + className });

    M.overlay = self.createElement('div', { 'class': 'fg-modal-overlay' });
    self.rootElement.appendChild(M.overlay);

    M.header = self.createElement('header', {});
    M.element.appendChild(M.header);

    M.body = self.createElement('div', { 'class': 'fg-modal-body' });
    M.element.appendChild(M.body);

    self.rootElement.appendChild(M.element);

    if (opts.showCloseBtn !== false) {
      M.showCloseBtn();
    }
  };

  modalPrototype.listen = function () {
    // Use postMessage API for "secure" cross-domain message-passing
    window.addEventListener("message", M.receive, false);
  };

  modalPrototype.receive = function (e) {
    if (e.origin !== self.config.urlRoot)
      return;

    var messageObject = e.data;

    switch (messageObject.type) {
      case "showModalCloseBtn":
        M.showCloseBtn();
        break;
      case "setModalHeader":
        M.setHeader(messageObject.title);
        break;
      case "setModalCloseBtnTimer":
        M.setCloseBtnTimer(messageObject.sec, messageObject.options);
        break;
    }
  };

  modalPrototype.showCloseBtn = function () {
    M.closeBtn = self.createElement('div', {
      'class': 'fg-modal-close icon-cancel'
    });
    M.element.appendChild(M.closeBtn);

    self.handleClick(M.closeBtn, function () {
      if (!this.getAttribute("data-disable"))
        M.close();
    });

    self.handleClick(M.overlay, function () {
      if (!M.closeBtn.getAttribute("data-disable"))
        M.close();
    });
  };

  modalPrototype.setCloseCallback = function (callback) {
    if (M.element) {
      M.closeCallbacks.push(callback);
    } else {
      callback();
    }
  };

  modalPrototype.updateCloseBtn = function (disable) {
    var currentSec = M.closeBtnTimer ? M.closeBtnTimer.current : 0;

    if (disable) {
      M.fallbackTimeout = setTimeout(M.updateCloseBtn, 5000);
    } else if (M.fallbackTimeout) {
      clearTimeout(M.fallbackTimeout);
    }

    if (currentSec > 0 || disable) {
      M.closeBtn.innerHTML = '<span class="counter">' + currentSec + '</span>' || '';
      M.closeBtn.setAttribute("data-disable", "true");
    } else {
      M.closeBtn.innerHTML = "";
      M.closeBtn.removeAttribute("data-disable");
    }
  };

  modalPrototype.setCloseBtnTimer = function (sec, options) {
    if (!options)
      options = {};


    M.clearCloseBtnTimer();

    M.closeBtnTimer = {
      sec: sec,
      current: (options.faketime || sec) + 1,
      timeout: 0,
      options: options
    };

    M.closeBtnTicker();
  };

  modalPrototype.clearCloseBtnTimer = function () {
    if (M.closeBtnTimer && M.closeBtnTimer.timeout) {
      clearTimeout(M.closeBtnTimer.timeout);
    }
  };

  modalPrototype.closeBtnTicker = function () {
    var options = M.closeBtnTimer.options;
    M.closeBtnTimer.current = Math.max(--M.closeBtnTimer.current, 0);

    if (M.closeBtnTimer.current === 0) {
      M.close();
      return false;
    } else {
      M.updateCloseBtn();
    }

    var faketime = parseInt(options.faketime || M.closeBtnTimer.sec, 10);

    M.closeBtnTimer.timeout = setTimeout(M.closeBtnTicker, parseInt((M.closeBtnTimer.sec / faketime) * 1000, 10));
  };

  modalPrototype.setContent = function (contentElement) {
    if (contentElement) {
      M.body.appendChild(contentElement);
    }
  };

  modalPrototype.setHeader = function (headline) {
    headline = headline || '';

    if (!M.header) {
      return;
    }

    M.header.innerHTML = headline.length ? headline + "" : "";
    M.header.style.display = headline.length ? "block" : "none";
  };

  modalPrototype.setDimensions = function (width, height) {
    if (!width || width === "")
      width = 480;

    if (!height || height === "")
      height = 500;

    M.element.style.maxHeight = parseInt(height, 10) + 60 + "px";
    M.element.style.maxWidth = parseInt(width, 10) + 20 + "px";
    M.element.style.display = "";
  };

  modalPrototype.close = function () {
    M.clearCloseBtnTimer();

    window.Zepto.each(M.closeCallbacks, function (key, callback) {
      if (typeof callback === "function") {
        callback();
      }
    });
    M.closeCallbacks = [];

    if (M.element) {
      M.element.parentNode.removeChild(M.element);
      delete M.element;
    }
    if (M.overlay) {
      M.overlay.parentNode.removeChild(M.overlay);
      delete M.overlay;
    }

    self.spinner.hide();
  };

  //create new instace of Module
  M = new module();
  //initialize Module
  M.init();

  return M;
};

// garbage collection
fg_api.prototype.GC = function (data) {
  data = data || {};

  if (data.hasOwnProperty("postCount")) {
    window.Zepto(this.rootElement).find("#fg-post-form" + data.postCount).remove();
    window.Zepto(this.fgOverlay).find("#fg-post-iframe" + data.postCount).remove();
  }
};

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/iframe.js

fg_api.prototype.iframeModule = function () {
  var self = this,
    M;

  function module() { // define private vars

  }

  var iframePrototype = module.prototype;

  iframePrototype.init = function () {
    self.storageIframe = self.createElement("iframe", {
      "id": "fg-storage-iframe",
      "name": "fg-storage-iframe",
      "src": window.fg_api.config.urlRoot + "/gameapi/storage/?uuid=" + self.config.uuid
    });
    window.fg_api.fgOverlay.appendChild(self.storageIframe);

    window.fg_api.comIframe = self.createElement("iframe", {
      "id": "fg-com-iframe",
      "name": "fg-com-iframe",
      "src": ""
    });
    window.fg_api.fgOverlay.appendChild(window.fg_api.comIframe);

    M.listen();

    return self;
  };

  iframePrototype.listen = function () {
    // Use postMessage API for "secure" cross-domain message-passing
    window.addEventListener("message", M.receive, false);
  };

  iframePrototype.receive = function (e) {
    if (e.origin !== self.config.urlRoot)
      return;

    var messageObject = e.data;

    if (messageObject.type) {
      if (messageObject.type == "updateIframeSize") {
        M.updateSize();
      }
    }
  };

  iframePrototype.create = function () {
    window.fg_api.iframeContainer = window.fg_api.createElement("div", { "id": "fg-iframe-container" });

    window.fg_api.iframeElement = self.createElement("iframe", {
      "id": "fg-iframe",
      "class": "fg-iframe",
      "name": "fg-iframe",
      "src": "",
      "seamless": "",
      "style": "bacfground: transparent none;"
    });
    window.fg_api.iframeContainer.appendChild(window.fg_api.iframeElement);

    return self;
  };

  iframePrototype.updateSize = function () {
    if (window.fg_api.iframeElement) {
      window.fg_api.iframeElement.style.height = "0px";
      window.fg_api.iframeElement.style.height = "100%";
    }

    return self;
  };

  /**
   * Set the iframe's src="" attribute
   */
  iframePrototype.load = function () {
  };

  /**
   * Displays the iframe with the specified width/height dimensions
   */
  iframePrototype.show = function (url, options) {
    var opts = window.Zepto.extend({
      width: "",
      height: ""
    }, options);

    if (!window.fg_api.iframeContainer) { //create iframe if not exist
      M.create();
    }

    window.fg_api.navigation.hideAll();

    self.modal.create(options);
    self.log("iframeContainer");
    self.log(self.iframeContainer);

    if (url.length) {
      self.iframeElement.setAttribute("src", self.config.urlRoot + url);
      self.spinner.show();

      self.iframeElement.onload = function () {
        self.spinner.hide();
      };
    } else {
      self.log("url not set");
    }

    if (opts.mode && opts.mode == "seamless")
      opts.height = "none";

    if (opts.mode && opts.mode == "ad")
      self.iframeElement.setAttribute("scrolling", "no");
    else
      self.iframeElement.setAttribute("scrolling", "yes");

    self.modal.setCloseCallback(function () {
      self.log("closeCallback");
      if (self.iframeElement) {
        self.iframeElement.setAttribute("src", "");
      }
    });

    self.modal.setContent(self.iframeContainer); //insert iframe into modal

    self.modal.setDimensions(opts.width, opts.height);

    return self;
  };

  iframePrototype.hide = function () {

    window.Zepto(self.fgOverlay).css({
      'max-width': '',
      'max-height': ''
    });

    return self;
  };

  iframePrototype.postData = function (url, dataObject) {
    var $formElement,
      k,
      v,
      $postIframe,
      postIframeName;
    self.postIframeCount = self.postIframeCount || 0;
    postIframeName = "fg-post-iframe" + self.postIframeCount;

    // create new iframe for each post
    $postIframe = window.Zepto("<iframe>", {
      "id": postIframeName,
      "name": postIframeName,
      "class": "fg-post-iframe",
      "src": ""
    });
    window.Zepto(self.fgOverlay).append($postIframe);
    // add post iframe counter to POST data so the server response is able to give that information back
    dataObject = dataObject || {};
    dataObject = window.Zepto.extend(dataObject, { "post_count": self.postIframeCount });


    $formElement = window.Zepto("<form>", {
      "id": "fg-post-form" + self.postIframeCount,
      "class": "fg-form",
      "action": self.config.urlRoot + url,
      "method": "POST",
      "style": "display:none",
      "target": postIframeName
    });
    self.postIframeCount++;
    window.Zepto(self.rootElement).append($formElement);

    for (k in dataObject) {
      if (!dataObject.hasOwnProperty(k)) {
        continue;
      }
      v = dataObject[k];

      $formElement.append(window.Zepto("<input>", {
        type: "hidden",
        name: k,
        value: v
      }));
    }
    $formElement.submit();

    return self;
  };

  //create new instace of Module
  M = new module();
  //initialize Module
  M.init();

  return M;
};

// garbage collection
fg_api.prototype.GC = function (data) {
  data = data || {};

  if (data.hasOwnProperty("postCount")) {
    window.Zepto(this.rootElement).find("#fg-post-form" + data.postCount).remove();
    window.Zepto(this.fgOverlay).find("#fg-post-iframe" + data.postCount).remove();
  }
};

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/notifications.js

fg_api.prototype.notificationsModule = function () {
  var self = this,
    M;

  function notificationsModule() { // define private vars
    this.items = [];
  }

  notificationsModule.prototype.init = function () {
    self.notificationArea = self.createElement('div', { 'id': 'fg-notifications' });

    self.notificationClose = self.createElement('div', { 'class': 'fg-close-notifications' });
    self.notificationClose.innerHTML = self.translate("api.modal_close");
    self.notificationClose.style.display = 'none';

    self.handleClick(self.notificationClose, function () {
      M.closeAll();
    });

    self.notificationArea.appendChild(self.notificationClose);

    self.rootElement.appendChild(self.notificationArea);

    M.listen();
  };

  notificationsModule.prototype.listen = function () {
    // Use postMessage API for "secure" cross-domain message-passing
    window.addEventListener("message", M.receive, false);
  };

  notificationsModule.prototype.receive = function (e) {
    if (e.origin !== self.config.urlRoot)
      return;

    var messageObject = e.data;

    if (messageObject.type) {
      if (messageObject.type == "notice") {
        self.modal.setCloseCallback(function () {
          M.add(messageObject);
        });
      } else if (messageObject.type == "action" && messageObject.action) {
        self[messageObject.action](messageObject.data);
      }
    }
  };

  notificationsModule.prototype.add = function (messageObject) {
    if (!messageObject.type || !messageObject.text) {
      return false;
    }

    M.closeByClass(messageObject.classes);

    var item = new self.notificationItem(messageObject);

    // Add to document
    self.notificationArea.insertBefore(item.element, self.notificationArea.firstChild);

    M.items.push(item);

    M.showClose();

    return self;
  };

  notificationsModule.prototype.removeFromList = function (item) {
    var idx = M.items.indexOf(item);
    M.items.splice(idx, 1);
  };

  notificationsModule.prototype.closeAll = function () {
    while (M.items.length > 0) {
      M.items[0].close();
    }
  };

  notificationsModule.prototype.showClose = function () {
    if (M.items.length > 1) {
      self.notificationClose.style.opacity = 1;
      self.notificationClose.style.display = "block";
    }
  };

  notificationsModule.prototype.hideClose = function () {
    if (M.items.length <= 1) {
      self.notificationClose.style.opacity = 0;
      self.notificationClose.style.display = "none";
    }
  };

  notificationsModule.prototype.closeByClass = function (classes) {
    for (var i = 0; i < M.items.length; i++) {
      if (M.items[i].classes == classes) {
        M.items[i].close();
      }
    }
  };

  //create new instace of Module
  M = new notificationsModule();
  //initialize Module
  M.init();

  return M;
};

fg_api.prototype.notificationItem = function (messageObject) {
  var self = window.famobi,
    M;

  function module() { // define private vars
    this.element = this.message = "";
  }

  var notificationPrototype = module.prototype;

  notificationPrototype.init = function (messageObject) {
    M.message = messageObject.text;
    M.classes = messageObject.classes;

    var ctaClass = "";
    if (messageObject.text.indexOf("btn-cta") > 0) // check if click to action button is inside
      ctaClass = " fg-notification-cta";

    M.element = document.createElement('div');
    M.element.setAttribute('class', 'fg-notification fg-fade fg-show ' + M.classes + ctaClass);

    var newMessage = document.createElement('div');
    newMessage.setAttribute('class', 'fg-message');
    newMessage.innerHTML = M.message;
    M.element.appendChild(newMessage);

    var closeBtn = document.createElement('div');
    closeBtn.setAttribute('class', 'fg-close-notification icon-cancel');
    M.element.appendChild(closeBtn);

    M.timeout = setTimeout(function () {
      M.close();
    }, 7000);

    if (messageObject.action) {
      self.handleClick(M.element, function () {
        self[messageObject.action]();
        self.notifications.closeAll();
      });
    }

    self.handleClick(closeBtn, function () {
      M.close();
    });
  };

  notificationPrototype.close = function () {
    M.element.parentNode.removeChild(M.element);
    clearTimeout(M.timeout);
    self.notifications.removeFromList(M);
    self.notifications.hideClose();
  };

  //create new instace of Module
  M = new module();
  //initialize Module
  M.init(messageObject);

  return M;
};

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/orientation.js

fg_api.prototype.orientationModule = function () {
  var self = this,
    M;

  function module() { // define private vars

  }

  var orientationPrototype = module.prototype;

  orientationPrototype.init = function () {
    if (typeof self.config.gameParams.orientation != 'undefined') {
      self.rootElement.className = self.rootElement.className + ' fg-orientation-' + self.config.gameParams.orientation;

      var fgLandscapeOverlay = document.createElement("div");
      fgLandscapeOverlay.setAttribute("id", "fg-landscape-overlay");

      var fgLandscapeImage = document.createElement("img");
      fgLandscapeImage.setAttribute("src", "html5games/gameapi/v1/images/IconRotateToLandscape.png");
      fgLandscapeImage.setAttribute("class", "fg-orientation-icon");
      fgLandscapeImage.setAttribute("alt", "switch to landscape");
      fgLandscapeOverlay.appendChild(fgLandscapeImage);

      self.rootElement.appendChild(fgLandscapeOverlay);

      var fgPortraitOverlay = document.createElement("div");
      fgPortraitOverlay.setAttribute("id", "fg-portrait-overlay");

      var fgPortraitImage = document.createElement("img");
      fgPortraitImage.setAttribute("src", "html5games/gameapi/v1/images/IconRotateToPortrait.png");
      fgPortraitImage.setAttribute("class", "fg-orientation-icon");
      fgPortraitImage.setAttribute("alt", "switch to portrait");
      fgPortraitOverlay.appendChild(fgPortraitImage);

      self.rootElement.appendChild(fgPortraitOverlay);

      window.Zepto(fgLandscapeImage).preventClick();
      window.Zepto(fgPortraitOverlay).preventClick();
    }
    return self;
  };

  M = new module();
  M.init();

  return M;
};

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/splash.js

fg_api.prototype.splashModule = function () {
  var self = this,
    M;

  function module() { // define private vars

  }

  var splashPrototype = module.prototype;

  splashPrototype.init = function () {
    var fgSplash = document.createElement("div");
    fgSplash.setAttribute("id", "fg-splash-screen");
    fgSplash.setAttribute("style", "bacfground-image: url('" + self.config.assetsPath + "/images/splashscreen_" + self.config.language + ".png');");
    self.rootElement.appendChild(fgSplash);

    window.Zepto(fgSplash).preventClick();

    setTimeout(function () {
      fgSplash.parentNode.removeChild(fgSplash);
    }, 2500);

    return self;
  };

  //create new instace of Module
  M = new module();
  //initialize Module
  M.init();

  return M;
};



// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/tracking.js

fg_api.prototype.trackingModule = function () {
  var self = this,
    M;

  function module() { // define private vars

  }

  var trackingPrototype = module.prototype;

  trackingPrototype.init = function () {

    window.famobi_dataLayer = window.famobi_dataLayer || [];

    // Use dataLayer variables
    window.famobi_dataLayer.push({
      'gameId': self.config.uuid,
      'packageId': window.famobi_gameID,
      'portalId': self.config.pid,
      'affiliateId': self.config.aid
    });

    // Track Gameplay after 30 seconds
    setTimeout(function () {
      M.trackEvent("Target", "Gameplay", window.famobi_gameID);

      // Track Highscore Session
      if (self.hasFeature("highscores")) {
        M.trackPassiveEvent('Highscore event', 'start', window.famobi_gameID);
      }
    }, 30E3);
  };

  trackingPrototype.data = function (dataObject) {
    window.famobi_dataLayer.push(dataObject);
  }

  trackingPrototype.trackEvent = function (category, action, label, nonInteraction) {
    if (typeof nonInteraction === 'undefined')
      nonInteraction = false;

    window.famobi_dataLayer.push({
      'event': 'Ingame event',
      'eventCategory': category,
      'eventAction': action,
      'eventLabel': label,
      'nonInteraction': nonInteraction
    });

    window.famobi_dataLayer.push({
      'event': undefined,
      'eventCategory': undefined,
      'eventAction': undefined,
      'eventLabel': undefined,
      'nonInteraction': undefined,
    });
  };

  trackingPrototype.trackPassiveEvent = function (category, action, label) {
    return M.trackEvent(category, action, label, true);
  };

  M = new module();
  M.init();

  return M;
};



// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/translation.js



// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/signals.js

/* Signals / Events received from the game */
fg_api.prototype.gameStarted = function () {
  this.log("Received gameStarted signal");
};

fg_api.prototype.gamePaused = function () {
  this.log("Received gamePaused signal");
};

fg_api.prototype.gameResumed = function () {
  this.log("Received gameResumed signal");
};

fg_api.prototype.gameOver = function () {
  this.ads.showAd();

  this.log("Received gameOver signal");
};

fg_api.prototype.levelUp = function () {
  this.ads.showAd();

  this.log("Received levelUp signal");
}

fg_api.prototype.setVolume = function (newVolume) {
  this.log("Received volume control signal");
};

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/gametranslation.js

window.gametranslationModule = function () {
  var self = this,
    M;

  function module() { // define private vars

  }

  var gameTranslationPrototype = module.prototype;

  gameTranslationPrototype.init = function () {
    M.curLangString = M.getUserLang();

    M.translationData = M.getGameTranslations();

    M.translateHtml(window.Zepto('body'));
  };

  gameTranslationPrototype.getSupportedLanguages = function () {
    return window.fg_api.config.languages;
  };

  gameTranslationPrototype.getGameTranslations = function () {
    var i18n = window.fg_api.config.game_i18n,
      lang = M.curLangString;

    if (i18n.current) {
      return i18n.current;
    }

    window.Zepto.each(i18n, function (language, translations) {
      window.Zepto.each(translations, function (key, value) {
        i18n[language][key] = value.replace(/\{lang\}/g, language);
      });
    });

    if (i18n[lang]) {
      i18n.current = window.Zepto.extend(i18n["default"], i18n[lang]);
    } else {
      i18n.current = i18n["default"];
    }

    return (window.fg_api.config.game_i18n.current = i18n.current);
  };

  gameTranslationPrototype.translateString = function (key) {
    return M.translationData[key] || null;
  };

  gameTranslationPrototype.getNavigatorLocale = function () {
    var language = "";

    if (navigator.language) {
      language = navigator.language;
    } else if (navigator.userLanguage) {
      language = navigator.userLanguage;
    } else if (navigator.browserLanguage) {
      language = navigator.browserLanguage;
    }

    return language;
  };

  gameTranslationPrototype.getNavigatorLanguage = function () {
    return M.getNavigatorLocale().substr(0, 2);
  };

  gameTranslationPrototype.getUserLang = function () {
    var urlParams = self.getUrlParams(),
      supportedLangs = M.getSupportedLanguages(),
      lang = M.getNavigatorLanguage();

    if (urlParams.locale && window.Zepto.inArray(urlParams.locale, supportedLangs) > -1) {
      return urlParams.locale;
    }

    switch (lang) {
      case "ch":
      case "at":
        return "de";
      case "de":
      case "en":
      case "tr":
        return lang;
      default:
        return window.Zepto.inArray(lang, supportedLangs) ? lang : "en";
    }
  };

  gameTranslationPrototype.translateHtml = function ($selector) {
    $selector.find('[data-i18n]').each(function () {
      var textkey = this.getAttribute('data-i18n');
      this.innerHTML = M.translateString(textkey);
    });
  };

  M = new module();

  M.init();

  return M;
};

fg_api.prototype.__ = function (key) {
   // console.log('6279 ===>  __  ===> ' + key)
  return window.config['game_i18n']['default'][key]
};

// Alias for __()
fg_api.prototype.translate = function (key) {
  return this.__(key);
};

fg_api.prototype.getCurrentLanguage = function () {
  return this.gametranslation.curLangString;
};

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/game.js

fg_api.prototype.gameModule = function () {
  var self = this,
    M;

  function module() { // define private vars

  }

  var gamePrototype = module.prototype;

  gamePrototype.init = function () {
    (function executeScript(gameJS) {
      if (!gameJS.length) {
        self.spinner.hide();
        return;
      }
      var currentScript = gameJS.shift(),
        callback = function () {
          executeScript(gameJS);
        };

      if (typeof currentScript === "function") {
        currentScript();
        callback();
      } else {
        var scriptEl = document.createElement("script");
        scriptEl.src = currentScript;
        scriptEl.onload = callback;
        self.bodyElement.appendChild(scriptEl);
      }
    })(window.famobi_gameJS);
  };

  M = new module();
  M.init();

  return M;
};

// /var/www/famobi/release-v2/laravel-fe/public/assets/js/gameapi/v1/init.js

fg_api.prototype.init = function () {
  var self = this;
  function require(module) {
    window[module] = self[module + "Module"];
  }

  function onloadCallback() {
    // keep order
    require("gametranslation");
    // navigation first, because event handlers and language switches otherwise don't work
    // require("navigation");
    // spinner first, used by game
    // require("spinner").show();
    // require("game");
    // require("tracking");
    require("modal");
    // require("iframe");
    // require("login");
    // require("highscores");
    // require("storage");
    // require("notifications");
    require("adapters");
    // require("ads");
    if (!detection.is.pc && window.screen && window.screen.height !== window.screen.width) {
      self.orientation = require("orientation");
    } else {
      if (window.console) {
        console.log("%c HTML5Games.com ", "background: #e44c25; color: #fff; border-right: 100px solid #fc6; border-left: 10px solid #000;");
      }
    }
  }
  self.onloadTimer = setTimeout(onloadCallback, 750);

  return self;
};





window.fg_api = new fg_api(window.config, [])
