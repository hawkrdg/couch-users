import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
	selector: 'edit-toolbar',
	templateUrl: 'edit-toolbar.component.html',
	styleUrls: [
		'edit-toolbar.component.scss'
	]
}) export class EditToolbarComponent {
	@Input() editMode = false;
	@Input() hideButtons = [];
	@Input() disableAll = false;
	@Output() action = new EventEmitter<string>();
	verify = false;
	verifyDelete = 'no';

	doAction(action) {
		this.verify = false;

		switch (action) {
			case 'new':
				this.action.emit('new');
				break;
			case 'edit':
				this.action.emit('edit');
				break;
			case 'delete':
				// this.verifyAction = action;
				this.verify = true;
				break;
			case 'save':
				this.action.emit('save');
				break;
			case 'cancel':
				this.action.emit('cancel');
				break;
			case 'reload':
				this.action.emit('reload');
				break;
		}
	}

	confirmDelete(action) {
		this.verify = false;
		if (action === 'yes') {
			this.action.emit('delete');
		}
	}
}
