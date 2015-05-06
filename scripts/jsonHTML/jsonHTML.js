/*
                                         jsonHTML
                                   Author: Jesse Parnell
                                        Description
    This allows you to render html using jQuery dynamically. Was created for one of my own projects,
    in which virtually none of my div objects, or much of any of the HTML could have been written
    statically in HTML. It was not written for performance, therefore it may not be good for very
    large projects, but it is good if you need to write code quickly in a more intuitive manner. 
    Basically, if you can do something in javaScript, you can now do it to your HTML.
*/

// get instance using myDB = new micronDB();
var micronDB = function() {
    return {
        db: [],
        hashTraverse: function(indx, func) {
            if(this.db[indx]) { //if there is something there...
                for(var i = 0; i < this.db[indx].length; ++i) {
                    var tmp = func(this.db[indx][i]);
                    if(tmp) { //send the object into the callback function.
                        return tmp;
                    }
                }
                return false;
            }
            return false;
        },
        calcIndex: function(data) { //takes a string
            var total = 0;
            for(var i = 0; i < data.length; ++i) {
                total += data.charCodeAt(i);
            }
            return total % 50; //max hash table size.
        },
        exists: function(data) { //takes a string object.
            var indx = this.calcIndex(data);
            return this.hashTraverse(indx, function(obj) {
                if(obj.id == data) {
                    return true;
                }
            });
        },
        hash: function(data) {
            if(!(this.exists(data))) {
                var indx = this.calcIndex(data.id);
                if(this.db[indx]) {
                    this.db[indx][this.db[indx].length] = data;
                    return true; //success
                } else {
                    this.db[indx] = [];
                    this.db[indx][this.db[indx].length] = data;
                    return true; //success
                }
            } else {
                return false; //already exists
            }
        },
        get: function(key) { //key is the id of the object.
            var indx = this.calcIndex(key);
            return this.hashTraverse(indx, function(obj) {
                if(obj.id == key) {
                    return obj;
                } 
            });
        },
        remove: function(key) {
            var indx = this.calcIndex(key);
            return this.hashTraverse(indx, function(obj) {
                if(obj.id == key) {
                    obj = undefined;
                    if(!(obj)) {
                        return true;
                    }
                    return false;
                }
            });
        },
        
        match: {
            where: function(key, obj) { //where the key and object have matching values.
                for(var prop in obj) {
                    if(typeof key[prop] != 'undefined') { //make sure that it is something first.
                        if(typeof key[prop] == 'function') { //if my key value is a function, execute it.
                            if(key[prop](obj[prop]) === true) { //makes sure that it is a real function.
                                return obj;
                            }
                        } else if(obj[prop] == key[prop]) { //if not, just see if the keys match.
                            return obj;
                        }
                    }
                }
                return false;
            },
        },
        traverse: function(key, matchFunc, db) {
            var find = function(searchKey, source) {
                var found = [];
                for(var i = 0; i < source.length; ++i) {
                    if(Array.isArray(source[i])) { //if it's an array, traverse that array too.
                        var tmp = find(searchKey, source[i]);
                        if(tmp.length > 0) { 
                            if(Array.isArray(tmp) && tmp.length < 2) { //if the array only has a single item.
                                found[found.length] = tmp[0];
                            } else {
                                found[found.length] = tmp;
                            }
                        }
                    } else if(matchFunc(searchKey, source[i])) {
                        found[found.length] = matchFunc(searchKey, source[i]);
                    }
                }
                return found;
            };
            var result = [];
            var used = 0;
            var funcAnd = function(tmp, db, key, property) { //handle the $and statement.
                if(typeof key[property] != 'undefined' && typeof property != 'number') {
                    if(!used) {
                        result = find(tmp, db);
                    } else {
                        if(result.length > 0) { //if the previous $and query found nothing, then do not add anything.
                            result = find(tmp, result); //make sure all the objects picked up in the current query still fit the next definition.
                        }
                    }
                }
                ++used; //determines how many times the $and is used.
            };
            var funcOr = function(tmp, db, key, property) { //handle the $or statement.
                if(typeof key[property] != 'undefined' && typeof property != 'number') {
                    var found = find(tmp, db);
                    if(result.length > 0) { //because it's an or, you want all the objects that fit the bill.
                        var exists = function(obj, arr) {
                            for(var j = 0; j < arr.length; ++j) {
                                if(arr[j] == obj) {
                                    return true;
                                }
                            }
                            return false;
                        };
                        for(var i = 0; i < found.length; ++i) {
                            if(!(exists(found[i], result))) {
                                result[result.length] = found[i];
                            }
                        }
                    } else {
                        result = find(tmp, db);
                    }
                }
            };
            for(var initProperty in key) {
                if(initProperty == '$and') {
                    used = 0; //allows the use of $and multiple times in one query.
                }
                var tmp = {};
                tmp[initProperty] = key[initProperty];
                if(initProperty == '$or' || initProperty == '$and') {
                    for(var property in tmp[initProperty]) { //what's inside the $or / $and property?
                        var nwTmp = {};
                        nwTmp[property] = tmp[initProperty][property];
                        if(initProperty == '$or') {
                            funcOr(nwTmp, db, tmp[initProperty], property);
                        } else {
                            funcAnd(nwTmp, db, tmp[initProperty], property);
                        }
                    }
                } else {
                    funcAnd(tmp, db, key, initProperty);
                }
            }
            return result;
        },
        insert: function(obj) {
            this.hash(obj);
        },
        query: function(query) {
            var current;
            for(var queryType in query) {
                if(typeof this.match[queryType] != 'undefined') { //if the query command exists.
                    if(undefined === current) {
                        current = this.traverse(query[queryType], this.match[queryType], this.db); //first time statement filter.
                    } else {
                        current = this.traverse(query[queryType], this.match[queryType], current); //filter again with the next statement.
                    }
                }
            }
            return current;
        },
    };
};

/*
    The hashing function has now been replaced with micronDB. This allows the programmer to actually
    execute queries on all the objects on the DOM. 
*/
var arrdb = new micronDB();

/*
    If the user does not provide a div id for their object, this will make a 
    random one.
*/
var makeID = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 12; i++ ) //rough estimate: 44,652 possible unique random ids.
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    /*if(!(arrdb.hash({id: text, append: undefined, }))) {
        text + Math.floor(Math.random() * 24);
        console.log('warning: Last div id was the same, are you making too many objects without div id\'s? ', text);
    }*/
    return text;
};

//Returns a small chunk of HTML as a string back to the parent function.
//Can produce HTML for a button, text box, or a div element.
var parsetype = function (type) {
    function ico(element) {
        var ico = "";
        for(var k in element) {
            var obj = k.toString();
            if(typeof element[k] == 'string') { //makes sure that the object is a property, and not an array, or function, or object, or whatever.
                if(k != 'text' && k != 'type') { //these are properties that are already handled and reserved for jsonHTML.
                    ico += ' ' + obj + '="' + element[k] + '"';
                }
            }
        }
        return ico;
    }
    var options = {
        button: function (element) {
            var html = {
                start: '<button type="button"',
                end: undefined !== element.text ? '>' + element.text + '</button>' : '></button>',
            };
            return html.start + ico(element) + html.end;
        },
        checkbox: function (element) {
            var html = {
                start: '<input type="checkbox"',
                end: '>' + (undefined !== element.text ? element.text : '') + '<br>',
            };
            return html.start + ico(element) + html.end;
        },
        generic: function(element) { //this can be used to generate div's
            var html = {
                start: '<' + element.type,
                end: undefined !== element.text ? '>' + element.text + '</' + element.type + '>' : '></' + element.type + '>',
            };
            return html.start + ico(element) + html.end;
        },
        html: function (element) {
            return element.data;
        },
        image: function (element) {
            var html = {
                start: '<img src='+element.src+' alt="'+element.text,
                end: '>',
            };
            return html.start + ico(element) + html.end;
        },
        input: function (element) { //generic input type html object.
            var html = {
                start: '<input',
                end: '/>',
            };
            return html.start + ico(element) + html.end;
        },
        spinner: function (element) {
            var html = {
                start: undefined !== element.text ? element.text+'<input type="number"' : '<input type="number"',
                end: '/>',
            };
            return html.start + ico(element) + html.end;
        },
        textbox: function (element) {
            var html = {
                start: '<input type="text"',
                end: undefined !== element.text ? ' value="' + element.text + '">' : '>',
            };
            return html.start + ico(element) + html.end;
        },

    };
    return undefined !== options[type] ? options[type] : options['generic']; //if jsonHTML does not have that type, it will try a generic method to create it.
};

//recursive function, simply loops until there are no more children objects,
//uses jQuery to append to the parent object (usually a div element).
function appendHTML(jsonObj, container, type) {
    var dfd = new $.Deferred();
    var exec = function () {
        if(typeof jsonObj == 'function'){
            jsonObj = jsonObj();
        }
        if(undefined === jsonObj.id) {
            jsonObj.id = makeID();
        }
        if(arrdb.exists(jsonObj.id)) {
            arrdb.get(jsonObj.id).append = type;
        } else {
            arrdb.hash(jsonObj);
        }
        jsonObj.parent = container;
        if(type) {
            $(container)[type](parsetype(jsonObj.type)(jsonObj));
        } else {
            $(container).append(parsetype(jsonObj.type)(jsonObj));
        }
        if(undefined !== jsonObj.children) {
            $.each(jsonObj.children, function () {
                appendHTML(this, '#'+jsonObj.id);
            });
        }
        if(undefined !== jsonObj.functions) {
            $.each(jsonObj.functions, function () {
                this();
            });
        }
        dfd.resolve();
    };
    exec();
    return dfd.promise();
}

var jConstructObjectManipulations = { //text object manipulations.
    textStyling: function(tmp) {
        return {
            hyperlink: function(linkTo) {
                tmp.text = '<a href='+linkTo+'>'+tmp.text+'</a>';
                return this;
            },
            bold: function() {
                tmp.text = '<b>'+tmp.text+'</b>';
                return this;
            },
            italicize: function() {
                tmp.text = '<i>'+tmp.text+'</i>';
                return this;
            },
            strong: function () {
                tmp.text = '<strong>'+tmp.text+'</strong>';
                return this;
            },
            heading: function(num) {
                tmp.text = '<h'+num+'>'+tmp.text+'</h'+num+'>';
                return tmp;
            },
            paragraph: function() {
                tmp.text = '<p>'+tmp.text+'</p>';
                return tmp;
            }
        };
    },
    //what you can immediately call on any object created by $jConstruct.
    basicPropertiesInsert: function(tmp, directInsert) {
        tmp.addChild = function(childObj) { //add a child JSON object on the fly.
            this.children[this.children.length] = childObj; 
            return this; 
        }; 
        tmp.addFunction = function(addFunc) { //add a function on the fly.
            this.functions[this.functions.length] = addFunc; 
            return this; 
        }; 
        tmp.appendTo = function(parent, type) { //append the JSON to a container div.
            var dfd = new $.Deferred();
            var id;
            if(typeof parent == "object") { //if a jsonHTML object is inserted intended as the object to append to, grab the id of it.
                id = '#' + parent.id;
            } else {
                id = parent;
            }
            appendHTML(this, id, type).done(function () {
                dfd.resolve();
            }); 
            this.state = dfd;
            return this;
        };
        tmp.event = function(type, func) {
            var divId = '#'+this.id;
            if($(divId)[0]) { //if the object is on the DOM.
                if(func) {
                    $(divId)[type](func);
                } else {
                    $(divId)[type]();
                }
            } else {
                if(func) {
                    tmp.addFunction(function () { $(divId)[type](func) });
                } else {
                    tmp.addFunction(function () { $(divId)[type]() });
                }
            }
            return this;
        };
        tmp.css = function(input) { //sets CSS to the current element.
            //console.log(this);
            var divId = '#'+this.id;
            if($(divId)[0]) { //if the object is rendered on the DOM.
                if(input) {
                    $(divId).css(input); //set the css
                } else { //if there was no input
                    return $(divId)[0].style; //return the object styles.
                }
            } else { //if not rendered on the DOM
                if(input) { //if css was input
                    this.addFunction(function() { //set CSS after it is rendered on the DOM.
                        $(divId).css(input);
                    });
                } else { //if there was no input
                    return $(divId)[0].style; //return the object styles.
                }
            }
            return this; //everything worked as expected.
        };
        //dynamically add new properties to the JSON HTML object on the fly.
        tmp.editProperty = function(properties) {
            jConstructObjectManipulations.dynamicPropertiesAdd(tmp, properties);
            return this;
        };
        //remove the object from the DOM.
        tmp.remove = function() {
            var divId = this.id;
            var myNode = document.getElementById(divId);
            while(myNode.firstChild) { //Experimental DOM object removal, jQuery "remove" leaves a temporary memory leak, this is intended to fix that issue.
                myNode.removeChild(myNode.firstChild);
            }
            $('#'+divId).remove();
            return this;
        };
        //allows the user to change what the text looks like with simple pre-generated HTML tags.
        tmp.textProperties = function(type, option) {
            var options = jConstructObjectManipulations.textStyling(tmp);
            if(option) {
                options[type](option);
            } else {
                options[type]();
            }
            return this;
        };
        //Allows the user to render the object on the DOM again.
        tmp.refresh = function() {
            var dfd = new $.Deferred();
            if(tmp.parent.length > 0) {
                tmp.remove();

                tmp.appendTo(tmp.parent, arrdb.get(tmp.id).append).state.done(function() {
                    dfd.resolve();
                }); //make sure to get from the hash table how the object was originally appended.

            } else {
                dfd.reject('Error: Parent of the object not defined. Was it rendered to the DOM yet?');
            }
            this.state = dfd;
            return this;
        };
    },
    dynamicPropertiesAdd: function(tmp, directInsert) {
        for(var propertyName in directInsert) {
            tmp[propertyName] = directInsert[propertyName];
        }
        return this;
    }
};


//so that you can construct an object that will work just like any other javaScript object.
function $jConstruct(htmlType, directInsert) {
    var tmp = {
        type: undefined !== htmlType ? htmlType : 'div', //defaults to a div
        children: [],
        functions: [],
    };
    if(directInsert) { //dynamically add all properties to the object from directInsert that the user inputs.
        jConstructObjectManipulations.dynamicPropertiesAdd(tmp, directInsert);
    }
    if(undefined === tmp.id) {
        tmp.id = makeID();
    }
    jConstructObjectManipulations.basicPropertiesInsert(tmp, directInsert);
    
    return tmp;
}

/*
    Copyright (C) 2014 Jesse Parnell
    
    v1.0
    This software / code is provided to you similarly as Free Software, (refer to: https://gnu.org/philosophy/free-sw.html ),
    by using or obtaining this code, you have the Free Software basic rights that do not contradict this license, if any, 
    and you agree, with common sense:

    To hold me __not__ responsible for any damages, or consequences of your malicious or "friendly" use of this code, it is up
    to the user to ensure the integrity and effects of this code before it is run, copied, deleted, modified, or utilized in any way. 
    This code is provided with no warranties, or guarantees. I ask from you to __retain__ credit back to me if you use my code 
    or any portion of it, and leave this stated license intact and not modified. This code / software is regarded as an inanimate 
    object, a tool, operating on natural laws, influenced by the current user and it's environment. The current user of the copy of 
    this tool must be held responsible for the way they use it, and not hold reponsible the creators, distributors, or copiers of that 
    tool. You may not redact, or modify this license within this repository / project / code / software, and leave the license fully, 
    unmodified, as is, unless given written or verbal permission from the Copyright holder of this code / software. This license is 
    not intended to cause a Closed-Source project to become Free Software, only the code and any portion of it from this project, 
    under this license, has to remain Free, and it's source publicly availible, unless permission granted from the Copyright holder. 

    Without manipulation to the license currently being utilized here, you may copy this license, and use it in __your__ own 
    code / software / projects / works, but, similarly, as stated above, you are responsible for the way you use the tools I created, 
    including this license.

    Feel free to fork, and ask to become a contributor, you have that right, if you have an improvement you have implemented in your 
    fork, that you believe is totally amazing, and should be included in the main project, ill review it, and possibly implement it, 
    and give you credit as one of the authors or contributors, and remember, your also protected under the license above.


            )
            
            (
        )   )
        (
    .---------------------.
    |        _____        |___      
    |     .'`_,-._`'.      __ \
    |    /  ( [ ] )  \    |  ||
    |   /.-""`( )`""-.\   |  ||
    |  ' <'```(.)```'> '  | _||
    |    <'```(.)```'>    |/ _/
    |     <'``(.)``'>      ./
    |      <``\_/``>      |
    |       `'---'`       |
    \github.com/trillobite/              Keep it black.
      \_________________/  
*/