var my_charities = {'Bill and Melinda Gates Foundation':0, 'Marie Curie':0, 'SOS Children\'s Villages':0, 'United Way':0};

var obj_init = getSessionObject();
//obj_init['allocationAmounts'] = {'Bill and Melinda Gates Foundation':0, 'Marie Curie':0, 'SOS Children\'s Villages':0, 'United Way':0};
//setSessionObject(obj_init)
//var my_charities = obj_init["allocationAmounts"];

$("#char-search").on('change keydown paste input', function(){
    search=document.getElementById('char-search').value.toLowerCase()
    if (search == ''){
        chars=document.getElementsByClassName('char_band');
        for (var c =0; c<chars.length; c++){
            chars[c].style.display = 'block'
        }
    }else{
        chars=document.getElementsByClassName('char_band');
        for (var c =0; c<chars.length; c++){
            if (chars[c].childNodes[0].innerHTML.toLowerCase().match(search)==null){
                chars[c].style.display = 'none'
            }else{
                chars[c].style.display = 'block'
            }
        }        
    }


})

function submit(){
    obj = getSessionObject()
    donation = obj['allocationAmounts']
    charities = Object.keys(donation).sort()
    modal_msg = document.getElementById('donation_summary')
    sub_list = document.createElement('ul')
    sub_list.style.listStyleType= 'none'
    total = document.createElement('li')
    total.innerHTML = "TOTAL DONATION: $" + obj['totalFunds']
    sub_list.appendChild(total)
    for (var i=0; i<charities.length; i++){
        ul = document.createElement('li')
        ul.innerHTML = charities[i] + ": $" + donation[charities[i]]*60/100.0
        sub_list.appendChild(ul)
    }
    modal_msg.appendChild(sub_list)

    var modal = document.getElementById("submitModal");
    modal.style.display = "block";

  var modalCloseButton = document.getElementById("subCloseButton");
  modalCloseButton.onclick = function(){
    modal.style.display = "none";
    obj = getSessionObject()
    obj['allocationAmounts'] = {}
    obj['percentAllocated'] = 0
    setSessionObject(obj)
  };

  // Click anywhere outside of modal causes it to close
  window.onclick = function(event){
    if (event.target == modal){
      modal.style.display = "none";
      obj = getSessionObject()
      obj['allocationAmounts'] = {}
      obj['percentAllocated'] = 0
      setSessionObject(obj)
      window.location.href = "./index.html";
    }
  }
}

function makeCharList(my_charities) {
    // Create the list element:
    charities = Object.keys(my_charities).sort()

    list_header = document.createTextNode('My Charities (' + charities.length + ')')
    document.getElementById('My_Charities').appendChild(list_header)

    var list = document.createElement('div');
    document.getElementById('charity_list').appendChild(list);

    var char_num_chars = document.createElement('span');
    char_num_chars.className ='num_chars'
    var no_char_msg = document.createTextNode('You Have Not Selected Any Charities Yet');
    char_num_chars.appendChild(no_char_msg);
    if (charities.length == 0){
        char_num_chars.style.display = 'block'
    }else{
        char_num_chars.style.display = 'none'
    }
    list.appendChild(char_num_chars);

    for(var i = 0; i < charities.length; i++) {
        // Create the list item:
        var char_band = document.createElement('div');
        char_band.className = "char_band";
        list.appendChild(char_band);
        var char_content_name = document.createElement('span');
        char_content_name.className ='char_name';
        var char_name = document.createTextNode(charities[i]);
        char_content_name.appendChild(char_name);
        char_band.appendChild(char_content_name);

        var slider = document.createElement('div')
        slider.className="sliders"
        slider.setAttribute('id', 'slider_'+i)
        char_band.appendChild(slider);

       $('#slider_'+i).slider({
            step: 1,
            min: 0,
            max: 100,
            value: my_charities[char_name],
            slide: function( event, ui ) {
                var amount = ui.value;
                char_name = this.parentNode.childNodes[0].innerHTML
                //total_alloc = 100 - total_alloc - my_charities[char_name]
                my_charities[char_name] = amount
                money = 100 - Object.values(my_charities).reduce(function(a,b){return a+b;},0)
                obj_slide = getSessionObject()
                if (money < 0){
                    char_error.style.visibility = 'visible'
                    my_charities[char_name] += money;
                    obj_slide['allocationAmounts'] = my_charities;
                    obj_slide['percentAllocated'] = 100;
                    setSessionObject(obj_slide);
                    this.parentNode.childNodes[2].innerHTML = my_charities[char_name]+'%';
                    $('#'+this.getAttribute('id')).slider('value', my_charities[char_name]);
                    prog_bar = document.getElementsByClassName('progress-bar')[0]
                    prog_bar.setAttribute('aria-valuenow', obj_slide['percentAllocated'])
                    prog_bar.setAttribute('style', "width:"+obj_slide['percentAllocated']+"%")
                    prog_bar.innerHTML = obj_slide['percentAllocated']+'%'
                    return false;
                }else{
                    char_error.style.visibility = 'hidden'
                    my_charities[char_name] = amount
                    obj_slide['allocationAmounts'] = my_charities;
                    obj_slide['percentAllocated'] = Object.values(my_charities).reduce(function(a,b){return a+b;},0);
                    setSessionObject(obj_slide);
                    this.parentNode.childNodes[2].innerHTML = amount+'%';
                    prog_bar = document.getElementsByClassName('progress-bar')[0]
                    prog_bar.setAttribute('aria-valuenow', obj_slide['percentAllocated'])
                    prog_bar.setAttribute('style', "width:"+obj_slide['percentAllocated']+"%")
                    prog_bar.innerHTML = obj_slide['percentAllocated']+'%'
                }
                update_pie(char_name, my_charities[char_name])
                //document.getElementById('fund').innerHTML = '$'+(obj_slide['percentAllocated']/100.0*obj_slide['totalFunds'])+'/$'+obj_slide['totalFunds']+' allocated'
                $("#"+this.getAttribute('id') +" .ui-slider-range").css( "background-color", '#C43E00' );

                $( "#"+this.getAttribute('id') +" .ui-state-default, .ui-widget-content .ui-state-default" ).css( "background-color", '#C43E00' );
            }
        });

        var char_content_value = document.createElement('span');
        char_content_value.className ='alloc_val'
        var char_value = document.createTextNode(my_charities[charities[i]]+'%');
        char_content_value.appendChild(char_value);
        char_band.appendChild(char_content_value);

        //creates trash can remove buttons
        var button = document.createElement("button");
        button.setAttribute('class', 'trash');
        var trash = document.createElement("span");
        trash.setAttribute('class', 'glyphicon glyphicon-trash');
        button.appendChild(trash)
        button.onclick = function(){ 
            obj_del = getSessionObject()
            obj_del['percentAllocated'] -= my_charities[this.parentNode.childNodes[0].childNodes[0].nodeValue]
            setSessionObject(obj_del);
            update_pie(this.parentNode.childNodes[0].childNodes[0].nodeValue, 0);
            delete my_charities[this.parentNode.childNodes[0].childNodes[0].nodeValue]
            obj_del['allocationAmounts'] = my_charities;
            this.parentNode.parentNode.removeChild(this.parentNode);
            document.getElementById("My_Charities").childNodes[0].nodeValue = 'My Charities (' + Object.keys(my_charities).length + ')'
            total_alloc = Object.values(my_charities).reduce(function(a,b){return a+b;},0);
                
            prog_bar = document.getElementsByClassName('progress-bar')[0]
            prog_bar.setAttribute('aria-valuenow', total_alloc)
            prog_bar.setAttribute('style', "width:"+total_alloc+"%")
            prog_bar.innerHTML = total_alloc+'%'
        }
        char_band.appendChild(button);
        

        // Add it to the list:
        //list.appendChild(char_band);
    }
    var char_error = document.createElement('span');
    char_error.className ='error_msg'
    var msg = document.createTextNode('Donation Budget Reached - Please Reduce One Or More Donations to Continue');
    char_error.appendChild(msg);
    char_error.style.visibility = 'hidden'
    char_error.style.color= '#C43E00'
    list.appendChild(char_error);

    // Finally, return the constructed list:
    return list;
}

makeCharList(my_charities);
