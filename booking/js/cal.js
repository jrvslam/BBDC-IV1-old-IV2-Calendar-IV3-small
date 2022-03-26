!function() {

    var today = moment();
    //var output = document.getElementById('output');
    var selected = null;
    var selDate = null;
    
  
    function Calendar(selector, events) {
      this.el = document.querySelector(selector);
      this.fullEvents = events;
      this.events = events;
      this.current = moment().date(1);
      this.draw();
      var current = document.querySelector('.today');
      if(current) {
        var self = this;
        window.setTimeout(function() {
          self.openDay(current);
        }, 500);
      }
    }
  
    Calendar.prototype.draw = function() {
      //Create Header
      this.drawHeader();
  
      //Draw Month
      this.drawMonth();
  
      this.drawLegend();
    }
  
    Calendar.prototype.drawHeader = function() {
      var self = this;
      if(!this.header) {
        //Create the header elements
        this.header = createElement('div', 'header');
        this.header.className = 'header';
  
        this.title = createElement('h1');
  
        var right = createElement('div', 'right');
        right.addEventListener('click', function() { self.nextMonth(); });
  
        var left = createElement('div', 'left');
        left.addEventListener('click', function() { self.prevMonth(); });
  
        //Append the Elements
        this.header.appendChild(this.title); 
        this.header.appendChild(right);
        this.header.appendChild(left);
        this.el.appendChild(this.header);
      }
  
      this.title.innerHTML = this.current.format('MMMM YYYY');
    }
  
    Calendar.prototype.drawMonth = function() {
      var self = this;
      
      // set dates for event
      var list = [];
      var currentMonthsArray = [];
      var monthArr = [];
      currentMonthsArray = JSON.parse(localStorage.getItem('Month'));
      for (i = 0; i < currentMonthsArray.length; i++) {
        monthArr.push(moment("01/" + currentMonthsArray[i]).month() + 1);
      }

      var currentDaysArray = [];
      var dayArr = [];
      currentDaysArray = JSON.parse(localStorage.getItem('Day'));
      for (i = 0; i < currentDaysArray.length; i++) {
        if (currentDaysArray[i] === "Thur") {
          currentDaysArray[i] = "Thu";
        }
      }

      var keepArray = [];
      var keepArray = JSON.parse(localStorage.getItem('Session'));


      this.fullEvents.forEach(function(ev) {
        if (monthArr.includes(parseInt(moment(ev.date).format('M')))) {
          if (currentDaysArray.includes(moment(ev.date).format('ddd'))) {
            if (keepArray.includes(ev.eventName)) {
              let temp = Object.assign({}, ev);
              temp.date = ev.date;
              list.push(Object.assign({}, temp));
            }
            
          }
          
        }
      });
        
      // for (let i = 0; i < self.current.daysInMonth(); i++) {
      //   this.events.forEach(function(ev) {
      //     //ev.date = self.current.today();
      //     ev.date = self.current.clone().date(i);
      //     list.push(Object.assign({}, ev));
      //     });
      // }
      this.events = list;
      
      
      if(this.month) {
        this.oldMonth = this.month;
        this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
        this.oldMonth.addEventListener('webkitAnimationEnd', function() {
          self.oldMonth.parentNode.removeChild(self.oldMonth);
          self.month = createElement('div', 'month');
          self.backFill();
          self.currentMonth();
          self.fowardFill();
          self.el.appendChild(self.month);
          window.setTimeout(function() {
            self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
          }, 16);
        });
      } else {
          this.month = createElement('div', 'month');
          this.el.appendChild(this.month);
          this.backFill();
          this.currentMonth();
          this.fowardFill();
          this.month.className = 'month new';
      }
    }
  
    Calendar.prototype.backFill = function() {
      var clone = this.current.clone();
      var dayOfWeek = clone.day();
  
      if(!dayOfWeek) { return; }
  
      clone.subtract('days', dayOfWeek+1);
  
      for(var i = dayOfWeek; i > 0 ; i--) {
        this.drawDay(clone.add('days', 1));
      }
    }
  
    Calendar.prototype.fowardFill = function() {
      var clone = this.current.clone().add('months', 1).subtract('days', 1);
      var dayOfWeek = clone.day();
  
      if(dayOfWeek === 6) { return; }
  
      for(var i = dayOfWeek; i < 6 ; i++) {
        this.drawDay(clone.add('days', 1));
      }
    }
  
    Calendar.prototype.currentMonth = function() {
      var clone = this.current.clone();
  
      while(clone.month() === this.current.month()) {
        this.drawDay(clone);
        clone.add('days', 1);
      }
    }
  
    Calendar.prototype.getWeek = function(day) {
      if(!this.week || day.day() === 0) {
        this.week = createElement('div', 'week');
        this.month.appendChild(this.week);
      }
    }
  
    Calendar.prototype.drawDay = function(day) {
      var self = this;
      this.getWeek(day);
  
      //Outer Day
      var outer = createElement('div', this.getDayClass(day));
      outer.addEventListener('click', function() {
        //alert('click');
        self.openDay(this);
      });
  
      //Day Name
      var name = createElement('div', 'day-name', day.format('ddd'));
  
      //Day Number
      var number = createElement('div', 'day-number', day.format('DD'));
  
  
      //Events
      var events = createElement('div', 'day-events');
      this.drawEvents(day, events);
  
      outer.appendChild(name);
      outer.appendChild(number);
      outer.appendChild(events);
      this.week.appendChild(outer);
    }
  
    Calendar.prototype.drawEvents = function(day, element) {
      if(day.month() === this.current.month()) {
        var todaysEvents = this.events.reduce(function(memo, ev) {
          if(ev.date.isSame(day, 'day')) {
            memo.push(ev);
          }
          return memo;
        }, []);
  
        todaysEvents.forEach(function(ev) {
          var evSpan = createElement('span', ev.color);
          element.appendChild(evSpan);
        });
      }
    }
  
    Calendar.prototype.getDayClass = function(day) {
      classes = ['day'];
      if(day.month() !== this.current.month()) {
        classes.push('other');
      } else if (today.isSame(day, 'day')) {
        classes.push('today');
      }
      return classes.join(' ');
    }
  
    Calendar.prototype.openDay = function(el) {
      var details, arrow;
      var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent;
      var day = this.current.clone().date(dayNumber);
      self = this;
  
      var currentOpened = document.querySelector('.details');
  
      //Check to see if there is an open detais box on the current row
      if(currentOpened && currentOpened.parentNode === el.parentNode) {
        details = currentOpened;
        arrow = document.querySelector('.arrow');
      } else {
        //Close the open events on differnt week row
        //currentOpened && currentOpened.parentNode.removeChild(currentOpened);
        if(currentOpened) {
          currentOpened.addEventListener('webkitAnimationEnd', function() {
            currentOpened.parentNode.removeChild(currentOpened);
          });
          currentOpened.addEventListener('oanimationend', function() {
            currentOpened.parentNode.removeChild(currentOpened);
          });
          currentOpened.addEventListener('msAnimationEnd', function() {
            currentOpened.parentNode.removeChild(currentOpened);
          });
          currentOpened.addEventListener('animationend', function() {
            currentOpened.parentNode.removeChild(currentOpened);
          });
          currentOpened.className = 'details out';
        }


  
        //Create the Details Container
        details = createElement('div', 'details in');
  
        //Create the arrow
        var arrow = createElement('div', 'arrow');
  
        //Create the event wrapper
  
        details.appendChild(arrow);
        el.parentNode.appendChild(details);

        // details.addEventListener('click', function() {
        //   alert('click');
        //   self.clickEvent(details);
        // })
      }
  
      var todaysEvents = this.events.reduce(function(memo, ev) {
        if(ev.date.isSame(day, 'day')) {
          memo.push(ev);
        }
        return memo;
      }, []);
  
      this.renderEvents(todaysEvents, details);
  
      arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
    }

    Calendar.prototype.clickEvent = function(event) {
      //var event = event.querySelectorAll
      //alert('click');
      console.log('Hello');
    }
  
    Calendar.prototype.renderEvents = function(events, ele) {
      //Remove any events in the current details element
      var currentWrapper = ele.querySelector('.events');
      var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));
  
      events.forEach(function(ev) {
        var div = createElement('div', 'event');
        var square = createElement('div', 'event-category ' + ev.color);
        var span = createElement('span', '', ev.eventName + ' - Time: ' + ev.time);
        var type = localStorage.getItem('TheorySelection');
        var radioButton = createElement('INPUT');
        if (type == 'BTP' || type == 'FTP') {
          radioButton.setAttribute('type', 'checkbox');
        } else {
          radioButton.setAttribute('type', 'radio');
        }
        div.appendChild(square);
        div.appendChild(span);
        div.appendChild(radioButton);
        wrapper.appendChild(div);
        //alert(ev.date.format('DD/MM/YYYY-ddd'));
        let temp = ev.date.format('DD/MM/YYYY-ddd') + "-" + ev.eventName;
        let slots = document.getElementsByName("slot");
        if (slots.length > 0) {
          slots.forEach(function(ev){
            if (ev.value === temp) {
              radioButton.checked = true;
            }
          })
        }
        div.addEventListener('click', function() {
          //alert('click' + ev.eventName);
          var date = createElement('div', 'date-format', ev.date.format('DD/MM/YYYY-ddd'));
          self.SetSelected(this, ev, date, type);
          //div.style.outline = "thick solid #000000";
          //GetSelectedItem(this);
          //this.clickEvent();
        })
      });
  
      if(!events.length) {
        var div = createElement('div', 'event empty');
        var span = createElement('span', '', 'No Events');
  
        div.appendChild(span);
        wrapper.appendChild(div);
      }
  
      if(currentWrapper) {
        currentWrapper.className = 'events out';
        currentWrapper.addEventListener('webkitAnimationEnd', function() {
          currentWrapper.parentNode.removeChild(currentWrapper);
          ele.appendChild(wrapper);
        });
        currentWrapper.addEventListener('oanimationend', function() {
          currentWrapper.parentNode.removeChild(currentWrapper);
          ele.appendChild(wrapper);
        });
        currentWrapper.addEventListener('msAnimationEnd', function() {
          currentWrapper.parentNode.removeChild(currentWrapper);
          ele.appendChild(wrapper);
        });
        currentWrapper.addEventListener('animationend', function() {
          currentWrapper.parentNode.removeChild(currentWrapper);
          ele.appendChild(wrapper);
        });
      } else {
        ele.appendChild(wrapper);
      }
    }

    Calendar.prototype.SetSelected = function(el, ev, date, type) {
      //alert('select' + el.innerText + ' ' + date.innerText);
      let temp = date.innerText + '-' + ev.eventName;
      if (type == 'BTP' || type == 'FTP') {
        var slots = document.getElementsByName("slot");
        if (slots.length === 0) {
          let elem;
          elem = document.createElement("input");
          elem.type = "hidden";
          elem.name = "slot";
          elem.innerHTML = date.innerText + '-' + ev.eventName;
          elem.value = date.innerText + '-' + ev.eventName;
          document.body.appendChild(elem);
          el.lastChild.checked = true;
        } else {
          var check = true;
          slots.forEach(function(ev2) {
            if (ev2.value === temp) {
              el.lastChild.checked = false;
              ev2.parentNode.removeChild(ev2);
              check = false;
            }
          });
          if (check) {
            let elem = document.createElement("input");
            elem.type = "hidden";
            elem.name = "slot";
            elem.innerHTML = date.innerText + '-' + ev.eventName;
            elem.value = date.innerText + '-' + ev.eventName;
            document.body.appendChild(elem);
            el.lastChild.checked = true;
          }
        }
      } else {
        var slots = document.getElementsByName("slot");
        if (slots.length === 0) {
          let elem = document.createElement("input");
          elem.type = "hidden";
          elem.name = "slot";
          elem.innerHTML = date.innerText + '-' + ev.eventName;
          elem.value = date.innerText + '-' + ev.eventName;
          document.body.appendChild(elem);
          el.lastChild.checked = true;
          selected = el;
        } else if (slots[0].value === temp) {
          el.lastChild.checked = false;
          slots[0].parentNode.removeChild(slots[0]);
          selected = null;
        } else {
          slots[0].parentNode.removeChild(slots[0]);
          let elem = document.createElement("input");
          elem.type = "hidden";
          elem.name = "slot";
          elem.innerHTML = date.innerText + '-' + ev.eventName;
          elem.value = date.innerText + '-' + ev.eventName;
          document.body.appendChild(elem);
          el.lastChild.checked = true;
          selected.lastChild.checked = false;
          selected = el;
        }
        // }
        // if (selected === null) {
        //   //el.style.outline = "thick solid #000000";
        //   el.lastChild.checked = true;
        //   selected = el;
        //   selDate = temp;
        //   document.getElementById("output").innerHTML = date.innerText + '-' + ev.eventName;
        //   document.getElementById("output").value = date.innerText + '-' + ev.eventName;
        //   document.getElementById("output").setAttribute("name", "slot");
        // } else if (selected === el) {
        //   //selected.style.outline = "initial";
        //   selected.lastChild.checked = false;
        //   selected = null;
        //   selDate = null;
        //   document.getElementById("output").innerHTML = '';
        //   document.getElementById("output").value = null;
        //   document.getElementById("output").setAttribute("name", "slot");
        // } else {
        //   //selected.style.outline = "initial";
        //   selected.lastChild.checked = false;
        //   //el.style.outline = "thick solid #000000";
        //   el.lastChild.checked = true;
        //   selected = el;
        //   selDate = temp;
        //   document.getElementById("output").innerHTML = date.innerText + '-' + ev.eventName;
        //   document.getElementById("output").value = date.innerText + '-' + ev.eventName;
        //   document.getElementById("output").setAttribute("name", "slot");
        // }
      }     
    }

    Calendar.prototype.GetSelectedItem = function(el) {
      output.innerHTML = el.eventName;
    }
  
    Calendar.prototype.drawLegend = function() {
      var legend = createElement('div', 'legend');
      var calendars = this.events.map(function(e) {
        return e.calendar + '|' + e.color;
      }).reduce(function(memo, e) {
        if(memo.indexOf(e) === -1) {
          memo.push(e);
        }
        return memo;
      }, []).forEach(function(e) {
        var parts = e.split('|');
        var entry = createElement('span', 'entry ' +  parts[1], parts[0]);
        legend.appendChild(entry);
      });
      this.el.appendChild(legend);
    }
  
    Calendar.prototype.nextMonth = function() {
      this.current.add('months', 1);
      this.next = true;
      this.draw();
    }
  
    Calendar.prototype.prevMonth = function() {
      this.current.subtract('months', 1);
      this.next = false;
      this.draw();
    }
  
    window.Calendar = Calendar;
  
    function createElement(tagName, className, innerText) {
      var ele = document.createElement(tagName);
      if(className) {
        ele.className = className;
      }
      if(innerText) {
        ele.innderText = ele.textContent = innerText;
      }
      return ele;
    }
  }();
  
  !function() {
    var current = moment();
    var data = [
      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-26")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-26")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-26")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-26")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-26")  },

      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-26")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-26")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-27")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-27")  },

      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-27")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-27")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-27")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-27")  },

      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-27")  },


      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-28")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-28")  },

      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-28")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-28")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-28")  },

      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-28")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-28")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-28")  },

      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-29")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-29")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-29")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-29")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-29")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-29")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-29")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-29")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-29")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-30")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-30")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-30")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-30")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-30")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-30")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-30")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-30")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-30")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-30")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-03-31")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-01")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-02")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-02")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-02")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-02")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-02")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-02")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-02")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-02")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-02")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-02")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-02")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-03")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-03")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-03")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-03")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-03")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-03")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-03")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-03")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-03")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-03")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-03")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-04")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-05")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-06")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-07")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-08")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-09")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-09")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-09")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-09")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-09")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-09")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-09")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-09")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-09")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-09")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-10")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-10")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-10")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-10")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-10")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-10")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-10")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-10")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-10")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-10")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-11")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-12")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-13")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-14")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-15")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-16")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-16")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-16")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-16")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-16")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-16")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-16")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-16")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-16")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-17")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-17")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-17")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-17")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-17")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-17")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-17")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-17")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-17")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-18")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-19")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-20")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-21")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-22")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-23")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-23")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-23")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-23")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-23")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-23")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-23")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-23")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-23")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-24")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-24")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-24")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-24")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-24")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-24")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-24")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-24")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-24")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-25")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-26")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-27")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-28")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-29")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-30")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-30")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-30")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-30")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-30")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-30")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-30")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-30")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-04-30")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-01")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-01")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-01")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-01")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-01")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-01")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-01")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-01")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-01")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-02")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-03")  },

      { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },
      { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: moment("2022-05-04")  },


      // { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: curr.date(2) },
      // { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },
      // { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: curr.date(2)  },

      // { eventName: '1', time: '(07:30-08:15)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '2', time: '(08:25-09:10)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '3', time: '(09:20-10:05)', calendar: 'BBDC', color: 'orange', date: curr.date(3) },
      // { eventName: '4', time: '(10:15-11:00)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '5', time: '(11:30-12:15)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '6', time: '(12:25-13:10)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '7', time: '(13:20-14:05)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '8', time: '(14:15-15:00)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '9', time: '(15:20-16:05)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '10', time: '(16:15-17:00)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '11', time: '(17:10-17:55)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '12', time: '(18:05-18:50)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '13', time: '(19:20-20:05)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '14', time: '(20:15-21:00)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '15', time: '(21:10-21:55)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
      // { eventName: '16', time: '(22:05-22:50)', calendar: 'BBDC', color: 'orange', date: curr.date(3)  },
  
      // { eventName: 'Game vs Portalnd', calendar: 'Sports', color: 'blue' },
      // { eventName: 'Game vs Houston', calendar: 'Sports', color: 'blue' },
      // { eventName: 'Game vs Denver', calendar: 'Sports', color: 'blue' },
      // { eventName: 'Game vs San Degio', calendar: 'Sports', color: 'blue' },
  
      // { eventName: 'School Play', calendar: 'Kids', color: 'yellow' },
      // { eventName: 'Parent/Teacher Conference', calendar: 'Kids', color: 'yellow' },
      // { eventName: 'Pick up from Soccer Practice', calendar: 'Kids', color: 'yellow' },
      // { eventName: 'Ice Cream Night', calendar: 'Kids', color: 'yellow' },
  
      // { eventName: 'Free Tamale Night', calendar: 'Other', color: 'green' },
      // { eventName: 'Bowling Team', calendar: 'Other', color: 'green' },
      // { eventName: 'Teach Kids to Code', calendar: 'Other', color: 'green' },
      // { eventName: 'Startup Weekend', calendar: 'Other', color: 'green' }
    ];
  
    
  
    function addDate(ev) {
      
    }
  
    var calendar = new Calendar('#calendar', data);
  
  }();
  