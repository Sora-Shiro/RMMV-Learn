//=============================================================================
// Command Issue
// SoraShiro_CommandIssue.js
//=============================================================================

var Sora = Sora || {};
Sora.CommandIssue = Sora.CommandIssue || {};
Sora.CommandIssue.version = 1.00;


//=============================================================================
// Scene_Menu
//=============================================================================

Sora.CommandIssue.Scene_Menu_create = Scene_Menu.prototype.create;
Scene_Menu.prototype.create = function () {
    Sora.CommandIssue.Scene_Menu_create.call(this);
    this.createSlotCommandWindow();
};

Sora.CommandIssue.Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function () {
    this._commandWindow = new Window_MenuCommand(0, 0);
    this._commandWindow.setHandler('strange', this.onSlotSelect.bind(this));
    this._commandWindow.setHandler('item', this.commandItem.bind(this));
    this._commandWindow.setHandler('skill', this.commandPersonal.bind(this));
    this._commandWindow.setHandler('equip', this.commandPersonal.bind(this));
    this._commandWindow.setHandler('status', this.commandPersonal.bind(this));
    this._commandWindow.setHandler('formation', this.commandFormation.bind(this));
    this._commandWindow.setHandler('options', this.commandOptions.bind(this));
    this._commandWindow.setHandler('save', this.commandSave.bind(this));
    this._commandWindow.setHandler('gameEnd', this.commandGameEnd.bind(this));
    this._commandWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._commandWindow);
};

var $increase = 1;

Scene_Menu.prototype.onSlotSelect = function () {
    $increase++;
    if($increase % 2 === 0) {
        var s = {};
        this._slotCommandWindow.setIModuleSlot(s);
    } else {
        this._slotCommandWindow.setIModuleSlot(null);
    }
    // Move Window
    this._slotCommandWindow.move(0, 0, 
        this._slotCommandWindow.windowWidth(), 
        this._slotCommandWindow.windowHeight());
    this._slotCommandWindow.select(0);
    this._slotCommandWindow.activate();
    this._slotCommandWindow.show();
}

Scene_Menu.prototype.createSlotCommandWindow = function () {
    this._slotCommandWindow = new Window_SlotCommand();
    this._slotCommandWindow.setHandler('cancel', this.onSlotCommandCancel.bind(this));
    this._slotCommandWindow.hide();
    
    this.addWindow(this._slotCommandWindow);
}

Scene_Menu.prototype.onSlotCommandCancel = function () {
    this._slotCommandWindow.deactivate();
    this._slotCommandWindow.hide();
    this._commandWindow.activate();
}

//=============================================================================
// Window_MenuCommand
//=============================================================================

Sora.CommandIssue.Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
Window_MenuCommand.prototype.addOriginalCommands = function () {
    Sora.CommandIssue.Window_MenuCommand_addOriginalCommands.call(this);
    this.addCommand('Strange Thing', 'strange', true);
}

//=============================================================================
// Slot Command Window
//=============================================================================

function Window_SlotCommand() {
    this.initialize.apply(this, arguments);
}

Window_SlotCommand.prototype = Object.create(Window_Command.prototype);
Window_SlotCommand.prototype.constructor = Window_SlotCommand;

Window_SlotCommand.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
    this._IModuleSlot = null;
};

Window_SlotCommand.prototype.windowHeight = function () {
    var result = this.fittingHeight(this.numVisibleRows());
    console.log(result);
    return result;
    // return 72;
    // return 108;
}

Window_SlotCommand.prototype.maxCols = function() {
    return 1;
};

Window_SlotCommand.prototype.setIModuleSlot = function(slot) {
    this._IModuleSlot = slot;
    this.refresh();
}

Window_SlotCommand.prototype.makeCommandList = function() {
    if(this._IModuleSlot) {
        this.addCommand('Change', 'change', true);
        this.addCommand('Remove', 'remove', true);
    } else {
        this.addCommand('Add', 'add', true);
    }
}

Window_SlotCommand.prototype.refresh = function() {
    this.clearCommandList();
    this.makeCommandList();
    this.contents.clear();
    this.drawAllItems();
}

Window_SlotCommand.prototype.update = function () {
    Window_Command.prototype.update.call(this);
}