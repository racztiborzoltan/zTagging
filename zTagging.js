/**
 * zTagging
 * v0.0.1
 * 
 * Requirements:
 *  - Object.assign()
 *  - document.querySelector()
 *  - document.querySelectorAll()
 *  - Node.insertBefore()
 *  - Element.classList
 *  - Array.filter()
 *  - Internet Explorer 11+
 *  - "paste" event: https://developer.mozilla.org/en-US/docs/Web/Events/paste
 *  
 * @TODO contenteditable végére pozicionálni fókusz elkapáskor
 * 
 * @TODO duplikációk engedélyezése, tiltása
 * 
 * @TODO drag and drop
 * 
 */
(function(){
    'use strict';
    
    var zTagging = function(settings){
        var self = this;
        
        self.settings = Object.assign({}, zTagging.defaults);
        self.settings = Object.assign(self.settings, settings);
        settings = null;
        
        self.wrapperElement = document.createElement('div');
        self.wrapperElement.classList.add('zTagging-wrapper');
        // kattintás a befoglaló elemen azonnal az utolsó elemre helyezi a fókuszt:
        self.wrapperElement.addEventListener('click', function(e){
            if (!isItemElement(e.target)) {
                self.listElement.querySelector('li:last-child').focus();
            }
        });
        
        self.listElement = document.createElement('ul');
        self.listElement.classList.add('list');
        self.wrapperElement.appendChild(self.listElement);
        // billentyűleütés történik egy lista elemben:
        self.listElement.addEventListener('keyup', function(e){
            var t = e.target;
            // Ha egy lista elemben történt billentyű leütés:
            if (isItemElement(t)) {
                if (t.textContent.trim() > '') {
                    // nem üres tartalom esetén a lista végére kerül egy új üres 
                    // lista elem, ha még nincs ott ilyen:
                    if (self.listElement.lastChild.textContent > '') {
                        self.listElement.appendChild(createItemElement());
                    }
                } else if (t.nextSibling) {
                    // Ha nem az utolsóban került űrítésre az érték, akkor 
                    // ezt a listaelemet el is lehet távolítani:
                    t.nextSibling.focus();
                    self.settings.removeTag.call(self, t);
                    t.remove();
                }
            }
        });
        // fókusz elkapás történik egy lista elemben:
        self.listElement.addEventListener('focusin', function(e){
            var t = e.target;
            if (isItemElement(t)) {
                t.contentBeforeEdit = t.textContent;
            }
        });
        // fókusz elhagyás történik egy lista elemben:
        self.listElement.addEventListener('focusout', function(e){
            var t = e.target;
            if (isItemElement(t)) {
                if (t.textContent.trim() > '') {
                    var is_new = t.newTag;
                    if (!is_new) {
                        // Csak ha tényleges változás történt
                        if (t.contentBeforeEdit !== t.textContent) {
                            self.settings.changeTag.call(self, t);
                        }
                    } else {
                        self.settings.addTag.call(self, t);
                        t.newTag = false;
                    }
                    delete t.contentBeforeEdit;
                }
            }
        });
        // Szöveg beillesztés esetén:
        self.listElement.addEventListener('paste', function(e){
            setTimeout(function () { 
                self.settings.filterPastedContent.call(this, e.target);
            }, 10);
        });
        
        self.listElement.appendChild(createItemElement());
        
        if (self.settings.theme && typeof self.settings.theme == 'function') {
            self.settings.theme.call(this);
        }
        
        function createItemElement()
        {
            var item = document.createElement('li');
            item.classList.add('item');
            item.appendChild(document.createElement('br'));
            item.setAttribute('contenteditable', 'true');
            item.newTag = true;
            return item;
        }
        
        function isItemElement(item)
        {
            return item.tagName.toUpperCase() === 'LI';
        }
    };
    
    /**
     * return settings
     * @return Element
     */
    zTagging.prototype.getSettings = function(){
        return this.settings;
    };
    
    /**
     * return wrapper element
     * @return Element
     */
    zTagging.prototype.getWrapperElement = function(){
        return this.wrapperElement;
    };
    
    /**
     * return list element
     * @return Element
     */
    zTagging.prototype.getListElement = function(){
        return this.listElement;
    };
    
    zTagging.defaults = {
            // téma beállítására szolgáló callback
            theme: function(){
            },
            // vágólapról szöveg beillesztés esetén a beillesztett tartalom szűrésére 
            // szolgáló callback
            // callback szignatúra: function(Element)
            filterPastedContent: function(element) {
                element.innerHTML = element.textContent;
            },
            addTag: function(item_element){
            },
            changeTag: function(item_element){
            },
            removeTag: function(item_element){
            },
    };
    
    window['zTagging'] = zTagging;
})();
