import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from "@angular/forms";

@Component({
  selector: '<app-list-item-field>',
  templateUrl : 'list.item.field.component.html'
})
export class ListItemFieldComponent  {
  focused: boolean = false;

  @Input() fForm        : NgForm;   // name of form this input belongs to
  @Input() fName        : string;   // unique name for <select> field
  @Input() fRef         : string;   // unique name for Template Reference Variable (TRV) for this field
  @Input() fValue       : string;   // model for <select> field
  @Input() fList        : any[];    // array of list items for <select>
  @Input() fListValue   : string;   // indicates how to structure <select> options
  @Input() fLabel       : string;   // label for <select>
  @Input() fIcon        : string;   // icon for <select>
  @Input() fColor       : string;   // color for icon
  @Input() fRequired    : boolean;  // if input is required
  @Input() fDisabled    : string;   // indicates field is disabled
  @Input() fOnFocus     : Function; // function to execute on <select> focus
  @Input() fOnChange    : Function; // function to execute on <select> change
  @Input() fAllowNew    : boolean = true;  // should <select> have a New Item entry at the top
  @Input() fEqual       : boolean;  // how to test for required input field (equality or inequality)
  @Input() fNewTest     : string;   // string to test against for required input field check
  @Input() fNewValue    : string;   // location to store new item value
  @Input() fNewName     : string;   // unique name for new item field
  @Input() fNewRef      : string;   // unique name for TRV for new item field
  @Input() fNewItemCheck: string;   // when to show text input errors
  @Input() fErrorMulti  : string;   // 'true' if allow multiple error messages
  @Output() fValueChange = new EventEmitter<string>();
  @Output() fNewValueChange = new EventEmitter<string>();

  constructor() {
  };
  
  showFocused = ()=> {
    this.focused = true;
    if(this.fOnFocus){ this.fOnFocus(); }
  }

  showNotFocused = ()=> {
    this.focused = false;
  }

  valueChange = ()=> {
    this.fValueChange.emit(this.fValue);
    if(this.fOnChange){ this.fOnChange(); }
  }

  newValueChange = ()=> {
    this.fNewValueChange.emit(this.fNewValue);
  }

}

