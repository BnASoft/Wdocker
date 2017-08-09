// network.js
"use strict";
const columns = [{
      checkbox: true,
      title: 'Check'
  },{
      field: 'Name',
      title: '네트워크 명',
      sortable : true,
      halign : "center",
      align : "center"
  },{
      field: 'Id',
      title: '네트워크 Id',
      sortable : true,
      halign : "center",
      align : "center"
  },{
      field: 'Created',
      title: '네트워크 생성일'
  },{
      field: 'Scope',
      title: 'Scope'
  },{
      field: 'Driver',
      title: 'Driver'
  },{
      field: 'EnableIPv6',
      title: 'EnableIPv6'
  },{
      field: 'IPAM',
      title: 'IPAM'
  },{
      field: 'IPAM.Config.0.IPRange',
      title: 'IPRange',
      sortable : true,
      halign : "center",
      align : "center"
  },{
      field: 'IPAM.Config.0.Subnet',
      title: 'Subnet',
      sortable : true,
      halign : "center",
      align : "center"
  },{
      field: 'IPAM.Config.0.Gateway',
      title: 'Gateway',
      sortable : true,
      halign : "center",
      align : "center"
  },{
      field: 'Internal',
      title: 'Internal'
  },{
      field: 'Attachable',
      title: 'Attachable'
  },{
      field: 'Containers',
      title: 'Containers'
  },{
      field: 'Options',
      title: 'Options'
  },{
      field: 'Labels',
      title: 'Labels'
  }];


  // function clickDropdown(id) {
  //   $("#container_list").on("click", "li a", function(event){
  //         $('#container').text($(this).text());
  //         checkAddColor('networklist', $(this).text(), "success");
  //     });
  //
  //
  // }

  // function networkSettings(name, driver, internal) {
  //   console.log(arguments);
  //   var config = require("./config");
  //
  //   if(!hasValue(name, internal)) {
  //     return false;
  //   }
  //   if(driver === "driver") {
  //     console.log("a");
  //     return false;
  //   }
  //
  //   config.setNetwork({"Name" : name, "Driver" : driver, "internal" : internal});
  //
  //   return  config.getNetwork();
  // }

$(function(){

  var $all = {};
  $all.init = function(){
    var self = this;
    var jsonUrl = '/myapp/container/data.json';
    var $contextMenu = $("#containerMenu")  ;
    var $dropDown =   $("#containerDropDown");
    var attr = "Names";
    // var index = 0;
    return initDropdown(jsonUrl, $contextMenu, $dropDown, attr);
  };
  $all.form = {};
  $all.form.data = {
    $name : $("#name"),
    $driverMenu : $("#driverMenu"),
    $driver : $('#driverDropDown'),
    $internal : $("#internal"),
    $container : $("#containerDropDown"),
    $containerMenu : $("#containerMenu")
  };
  $all.form.formName = "네트워크 생성";
  $all.form.formEvent = "CreateNetwork";
  $all.form.$newForm =  $(".newForm");
  $all.form.$form = $("#hiddenForm");
  $all.form.portlists = [];
  $all.form.$portAdd = $(".portAdd");
  $all.form.$portlists = $(".portlists");
  $all.form.dropDown =  {
    $dropDown : $('#driverDropDown'),
    default : "driver"
  };
  $all.form.settingMethod = {
    get : "getNetwork",
    set : "setNetwork"
  };
  $all.form.getSettingValue = function() {
    var self = this.data ;

    return {
      Name : self.$name.val(),
      Driver : self.$driver.text().trim(),
      internal : self.$internal.prop('checked')
    }
  }

  $all.form.initDropdown = function(){
    var self = this;
    var data = ["bridge", "overlay", "macvlan"];
    var $contextMenu =   self.data.$driverMenu;
    var $dropDown =   self.data.$driver;

    return initDropdownArray(data, $contextMenu, $dropDown);
  }
  $all.connect = {};
  $all.connect.dockerinfo = "network";
  $all.table = {};
  $all.table.main = {
      "$table" : $(".jsonTable"),
      "hideColumns" : ["EnableIPv6", "Labels", "IPAM", "Containers", "Options", "Created", "Id"],
      "columns" : columns,
      "jsonUrl" : '/myapp/network/data.json'
    };

  $all.event = {};
  function clickDefault(client, eventName, table){
    return function(){
      client.sendEventTable(eventName, table);
    };
  }
  $all.event.remove = {
    $button : $("#remove"),
    eventName : "RemoveNetwork",
    clickEvent : clickDefault
  };
  $all.event.connect = {
    $button : $("#connect"),
    eventName : "ConnectNetwork",
    clickEvent : function(client, eventName, table){
      return function(){
        if($("#containerDropDown").text().trim() === "Containers") {
          return false;
        }else {
          client.sendEventTable(eventName, table);
        }
      };
    }
  };
  $all.event.disconnect = {
    $button : $("#disconnect"),
    eventName : "DisconnectNetwork",
    clickEvent : function(client, eventName, table){
      return function(){
        if($("#containerDropDown").text().trim() === "Containers") {
          return false;
        }else {
          client.sendEventTable(eventName, table);
        }
      };
    }
  };
  $all.completeEvent = function(data, callback){
    console.log(arguments);
    if(hasValue(data)){
        var dialog = require("./dialog.js");

         var finished = new dialog("네트워크", data.msg + data.statusCode, $("body"));
         finished.setDefaultButton('Close[Enker]', 'btn-primary create');
         finished.show();
         finished.close(5000);
         callback;
       }
  };

  var main = require("./main.js");
  main.init($all);
  var networkTable = main.getMainTable();
    var $detail = $("#detail");
      networkTable.clickRow($detail);

  var expandinfo = [{
     url : "/myapp/network/",
     keys : ["Containers", "Name", "Id", "Driver"]
   }];
   networkTable.expandRow(expandinfo);


});
