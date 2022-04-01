import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialDesignModule } from '../material/material.module';
import { EditToolbarComponent } from './edit-toolbar.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		MaterialDesignModule
	],
	declarations: [
		EditToolbarComponent
	],
	exports: [
		EditToolbarComponent
	],
	entryComponents: [
		EditToolbarComponent
	]
}) export class EditToolbarModule {}
