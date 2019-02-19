//Budget Controller
var budgetController = (function(){
    
    var Expenses = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };
    
    Expenses.prototype.calcPercentage=function(totalIncome){
      
        if(totalIncome>0){
            this.percentage=Math.round((this.value/totalIncome) * 100);
            
        }else{
            this.percentage=-1;
        }       
    };
    
    Expenses.prototype.getPercentage=function(){
      return this.percentage;  
    };
    
    var Incomes = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };
    
    var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
           sum+=cur.value;
   
        });
        data.totals[type]=sum;
        
    }
    
    var data ={
      
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
     };
    
    return{
      addItem:function(type,description,value){
       var newItem,ID;
          
          if(data.allItems[type].length>0){
              ID=data.allItems[type][data.allItems[type].length-1].id +1;
          }else{
              ID=0;
          }
          
          
          if(type==='exp'){
              newItem=new Expenses(ID,description,value);
              
         
          }else if(type==='inc'){
              newItem=new Incomes(ID,description,value);
          }
          data.allItems[type].push(newItem);
  return newItem;
      },
        deleteItem:function(type,id){
            
          var ids,index;
            ids=data.allItems[type].map(function(current){
               return current.id;
            });
            index=ids.indexOf(id);
            
            if(index!==-1){
                data.allItems[type].splice(index,1);
            }
            
        },
        calculateBudget:function(){
//            1.calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
//            2.calculate budget
            data.budget=data.totals.inc-data.totals.exp;
//            3.calculate the percentage
            if (data.totals.inc>0){
            data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
                        
            }   else{
                data.percentage=-1;
            }   
        },
        
        calculatePercentages:function(){
           
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
            
            
        },
        
        getPercentage:function(){
            var percen = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return percen;
        },
        getBudget:function(){
            return{
                budget:data.budget,
                totalinc:data.totals.inc,
                totalexp:data.totals.exp,
                percentage:data.percentage
                
            };
            
            
        },
        testing:function(){
            console.log(data);
        }
    };
    
    
})();



// UI Controller
var UIController = (function(){
    
    var DOMstrings ={
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        displayPercentageLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    };
    
    var nodeListForEach=function(list,callback){
                
                for( var i=0; i<list.length; i++){
                    callback(list[i],i);
                }
            };
    
    var formatNumber=function(num,type){
        var int,dec,splitNum;
        
        num=Math.abs(num);
        num=num.toFixed(2);
        
        splitNum=num.split('.');
        int=splitNum[0];
        dec=splitNum[1];
        
        if(int.length>3){
            int=int.substr(0,int.length-3)+","+int.substr(int.length-3,int.length);
        }
        
        return (type==='exp'?'- ':'+ ')+int+'.'+dec;
    
    };    
    return {
        getInput:function(){
        return {
         type:document.querySelector(DOMstrings.inputType).value,
         description:document.querySelector(DOMstrings.inputDescription).value,
         value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
        };

    },
        addListItem:function(obj,type){
            //Create Html string with Placeholder
          var html,newHtml,element;
            
            if(type==='inc'){
                element=DOMstrings.incomeContainer;
                 html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if (type==='exp'){
                element=DOMstrings.expensesContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }
            //replace the placeholder with actual text
            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
            
            //Insert the Html into Dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        
        deleteListItem:function(selectorID){
            
            var select=document.getElementById(selectorID);
            select.parentNode.removeChild(select);
            
        },
        
        clearFields:function(){
          var fields, fieldsArr;
            fields=document.querySelectorAll(DOMstrings.inputDescription+", "+DOMstrings.inputValue);
            fieldsArr=Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array){
                current.value="";
            });
            fieldsArr[0].focus();
        },
        displayBudget:function(obj){
            var type;
            obj.budget>0?type='inc':type='exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalinc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent=formatNumber(obj.totalexp,'exp');
            
            if(obj.percentage>0){
                document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage+'%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent='---';
            }
  
        },
        
        displayPercentage:function(percentages){
            var fields=document.querySelectorAll(DOMstrings.displayPercentageLabel);
            
            
            
            nodeListForEach(fields,function(current,index){
                
                if(percentages[index]>0){
                    
                    current.textContent=percentages[index]+"%";
                }else{
                    current.textContent='---';
                }
                
            });
   
        },
        
        displayMonth:function(){
            var now,year,month,months;
            
            now= new Date();
            
            months=['January','February','March','April','May','June','July','August','September','October','November','December'];
            month=now.getMonth();
            
            year=now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent=months[month]+' '+year;
            
            
        },
        
        changedType:function(){
          
            var fields=document.querySelectorAll(
            
            DOMstrings.inputType+", "+
            DOMstrings.inputDescription+", "+
            DOMstrings.inputValue           
            );
            
            nodeListForEach(fields,function(cur){
            cur.classList.toggle('red-focus');           
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        getDom:function(){
        return DOMstrings;
    }
    
    
    };
    
    
})();




//Global App Controller


var controller = (function(budgetctrl,uictrl){
     
    var setupEventListeners=function(){
        var DOM=uictrl.getDom();  
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
      
    document.addEventListener('keypress',function(event){
  if(event.keyCode===13 || event.which===13){
      
      ctrlAddItem();
  }

    });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',uictrl.changedType);
    };
   
    
   var updateBudget=function(){
//      1.calculate the budget
    budgetctrl.calculateBudget();
//      2.return the budget
      var budget=budgetctrl.getBudget();
//      3.display the budget on the UI
       
    uictrl.displayBudget(budget);
       
   };
    
    var updatepercentages=function(){
        
//        1.calculate the percentages
        budgetctrl.calculatePercentages();
//        2.read the percentages from the budget controller
        var percentages=budgetctrl.getPercentage();
//        3.update the UI
        uictrl.displayPercentage(percentages);
        
        
    };
    
    
  
    var ctrlAddItem=function(){
    var input,newItem;
        
//        1.get the input values
       
      input=  uictrl.getInput();
        
        if(input.description!=="" && !isNaN(input.value) && input.value>0){
//             2.add new Item
        newItem=budgetctrl.addItem(input.type,input.description,input.value);
//        3.add new item to the Ui
        uictrl.addListItem(newItem,input.type);
//        4.clear the input fields
        uictrl.clearFields();
//        5.update the budget
        updateBudget();
//        4.calculate percentage
            updatepercentages();
            
        }
//      
    };
    
    var ctrlDeleteItem=function(event){
        var eventId,splitID;
        eventId=event.target.parentNode.parentNode.parentNode.parentNode.id;
    
        if(eventId){
              splitID=eventId.split('-');
        
        type=splitID[0];
        ID=parseInt(splitID[1]);
            
//            1.delete the item from the data structure
            budgetctrl.deleteItem(type,ID);
            
//            2.delete the item from the UI
            uictrl.deleteListItem(eventId);
            
//            3.update the budget
            updateBudget();
            
//            4.calculate percentage
            updatepercentages();
            
        }
      
        
    };
    
    return{
        init:function(){
           
            setupEventListeners();
            UIController.displayMonth();
            UIController.displayBudget({
                budget:0,
                totalinc:0,
                totalexp:0,
                percentage:-1
                
            });
        }
    };
  
})(budgetController,UIController);

controller.init();
