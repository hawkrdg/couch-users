import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GlobalDataService } from "../providers/global-data-service";
import { CouchDbService } from "../providers/couchdb-service";
import { cloneDeep } from "lodash-es";

class NewUser {
  _id       = '';
  name      = '';
  fullname  = '';
  type      = 'user';
  password  = '';
  roles     = [];
  email     = '';
  phone     = '';
  notes     = '';
}
class User {
  _id             = '';
  _rev            = '';
  name            = '';
  type            = 'user';
  roles           = [];
  email           = '';
  phone           = '';
  notes           = '';
  password_scheme = ''
  iterations      = 10;
  derived_key     = '';
  salt            = '';
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  userPassword = '';
  currentRolesBuf:any[] = [];
  availableRolesBuf:any[] = []
  @ViewChild('userList') userList!: any;
  @ViewChild('userRolesList') userRolesList!: any;
  @ViewChild('availableRowsList') availableRowsList!: any;
  currentEditButton;
  showDataLoading = false;
  showNeededFields = false;
  showChangePW = false;
  changePW = false;
  showErrorMsg = false;
  errorMsg = '';

  constructor(
    public data: GlobalDataService,
    private db: CouchDbService
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit() fires...');
    this.onUserChange(this.data.users[this.data.currentUserIdx], this.data.currentUserIdx);
  }

  //-- edit control bar logic...
	//
	async handleEditControls(btn) {
		switch (btn) {
			case 'new':
        console.log(`adding user...`);
        this.data.currentUserSubmitBuf = new NewUser;
        this.currentRolesBuf = [];
        this.availableRolesBuf = cloneDeep(this.data.availableRoles);
				this.data.editMode = true;
				this.data.addOrEdit = 'add';
				break;

			case 'edit':
				console.log(`editing meter...`);
						// this.data.savedMeterBuf = cloneDeep(this.data.currentMeterBuf);
						// this.data.savedMeterIdx = this.data.currentMeterIdx;
				this.data.editMode = true;
				this.data.addOrEdit = 'edit';
				break;
			case 'delete':
				this.data.editMode = false;
				console.log(`delete...`)
				break;

			case 'save':
				console.log(`saving user...`);
        this.data.currentUserSubmitBuf.roles = this.currentRolesBuf.map(r => {
          return r.role;
        });

        if (this.data.addOrEdit === 'add') {
          if (!this.data.currentUserSubmitBuf.name || !this.data.currentUserSubmitBuf.password || this.currentRolesBuf.length === 0) {
            this.showNeededFields = true;
          } else {
            try {
              this.data.currentUserSubmitBuf._id = 'org.couchdb.user:' + this.data.currentUserSubmitBuf.name.trim();
              await this.db.couchCreateRecord('_users', this.data.currentUserSubmitBuf).then(
                d => {
                  console.log('added new user...')
                },
                err1 => {
                  console.log(`ERROR ADDING USER: ${JSON.stringify(err1)}`);
                }
              );
              this.db.couchGetRecordByID('_users', this.data.currentUserSubmitBuf._id).then(
                newrec => {
                  console.log('fetched new user...')
                  this.data.users.push(newrec);
                  this.data.users.sort((a, b) => a._id > b._id);
                  this.data.currentUserIdx = this.data.findRecordIndex(this.data.users, '_id', newrec._id);
                  this.data.currentUserBuf = cloneDeep(newrec);
                	this.data.currentUserSubmitBuf = cloneDeep(newrec);
                  // this.initRolesBuffers();
                  this.userList.renderRows();
                },
                err2 => {
                      console.log(`ERROR FETCHING NEW USER: ${JSON.stringify(err2)}`);
                }
              );
            } catch (error) {
              console.log(`ERROR ADDING USER CB: ${JSON.stringify(error)}`);
              this.errorMsg = `ERROR ADDING USER CB: ${JSON.stringify(error)}`;
              this.showErrorMsg = true;
            }
          }
        } else {
          if (!this.data.currentUserSubmitBuf.name || this.currentRolesBuf.length === 0) {
            this.showNeededFields = true;
          } else {
            try {
              await this.db.couchUpdateRecord('_users', this.data.currentUserSubmitBuf).then(
                d => {
                  this.data.currentUserSubmitBuf._rev = d.rev;
                  this.data.currentUserBuf = cloneDeep(this.data.currentUserSubmitBuf);
                  this.data.users[this.data.currentUserIdx] = cloneDeep(this.data.currentUserSubmitBuf);
                  console.log(`edited user ${JSON.stringify(this.data.currentUserSubmitBuf)}...`);
                },
                err1 => {
                  console.log(`ERROR EDITING USER: ${JSON.stringify(err1)}`);
                }
              );
            } catch (error) {
              console.log(`ERROR EDITING USER CB: ${JSON.stringify(error)}`);
            }
          }
        }
        this.data.editMode = false;
        this.data.addOrEdit = 'edit';
				break;
			case 'cancel':
				console.log(`cancelling user edit...`);
        this.data.currentUserSubmitBuf = cloneDeep(this.data.users[this.data.currentUserIdx]);
        this.initRolesBuffers();
				this.data.editMode = false;
        this.data.addOrEdit = 'edit';
				break;
			case 'reload':
				this.data.editMode = false;
				console.log(`reload...`);
				this.data.isDataLoaded = false;
				this.showDataLoading = true;
				await this.data.loadData();
				this.showDataLoading = false;
				break;
		}
		this.currentEditButton = btn;
	}

  onUserChange(row, idx) {
    this.data.currentUserIdx = idx;
    this.data.currentUserBuf = cloneDeep(this.data.users[this.data.currentUserIdx]);
		this.data.currentUserSubmitBuf = cloneDeep(this.data.users[this.data.currentUserIdx]);
    this.currentRolesBuf = this.data.currentUserBuf.roles;
    this.initRolesBuffers();
    console.log(`onUserChange() - currentUser: ${this.data.currentUserBuf.name}, Idx: ${this.data.currentUserIdx}`);
  }

  initRolesBuffers = () => {
    console.log('setting up roles arrays...')
    this.currentRolesBuf = [];
    this.availableRolesBuf = cloneDeep(this.data.availableRoles);
    this.availableRolesBuf.forEach((el, idx) => {
      this.data.currentUserBuf.roles.forEach((r:string) => {
        if (el.role === r) {
          console.log(`REMOVING ROLE: ${r}`)
          this.currentRolesBuf.push(el)
          // this.availableRolesBuf.splice(idx, 1);
        }
      });
    });
    this.currentRolesBuf.sort((a, b) => b - a);
    this.currentRolesBuf.forEach(el => {
      this.availableRolesBuf.splice(el.idx, 1);
    });
    this.currentRolesBuf.sort((a, b) => a - b);

  }

  addUserRole = (roleIdx) => {
    console.log(`adding role: ${this.availableRolesBuf[roleIdx].role}`);
    this.currentRolesBuf.push(this.availableRolesBuf[roleIdx]);
    this.availableRolesBuf.splice(roleIdx, 1);
    this.sortRolesArray(this.currentRolesBuf);
    this.sortRolesArray(this.availableRolesBuf);
    this.userRolesList.renderRows();
    this.availableRowsList.renderRows();
  }

  removeUserRole = async (roleIdx) => {
    console.log(`removing role: ${this.currentRolesBuf[roleIdx].role}`);
    this.availableRolesBuf.push(this.currentRolesBuf[roleIdx]);
    this.currentRolesBuf.splice(roleIdx, 1);
    this.sortRolesArray(this.currentRolesBuf);
    this.sortRolesArray(this.availableRolesBuf);
    this.userRolesList.renderRows();
    this.availableRowsList.renderRows();
  }

  sortRolesArray = (rolesArray) => {
    rolesArray.sort((a, b) => {
      return a.idx - b.idx;
    });
  }
}
