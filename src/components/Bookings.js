import React from 'react';
import * as ReactDOM from "react-dom";
import { ScheduleComponent, ViewsDirective, ViewsModelDirective, Week, Agenda, Inject } from '@syncfusion/ej2-react-schedule';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';  
import { MultiSelectComponent } from '@syncfusion/ej2-react-dropdowns';
import * as firebase from "firebase";

class Bookings extends React.Component {
    constructor(props) {
        super(props);
        this.scheduleObj = {};
        this.multiSelectObj = {};
        this.boundedEvents = [];

        this.appointmentsRef = firebase.database().ref('User-Appointments').child(firebase.auth().currentUser.uid);
        this.appointmentsRef.off();
        this.broadCastAddedEvents = this.broadCastAddedEvents.bind(this);
        this.broadCastChangedEvents = this.broadCastChangedEvents.bind(this);
        this.appointmentsRef.limitToLast(12).on('child_added', this.broadCastAddedEvents);
        this.appointmentsRef.limitToLast(12).on('child_changed', this.broadCastChangedEvents);
    }

    broadCastAddedEvents(data) {
        let val = data.val();
        val.key = data.key;
        val.StartTime = new Date(val.StartTime);
        val.EndTime = new Date(val.EndTime);
        if (this.boundedEvents.findIndex(e => e.Id === val.Id) === -1) {
            this.boundedEvents.push(val);
            this.scheduleObj.refreshEvents();
        }
    }

    broadCastChangedEvents(data) {
        let val = data.val();
        val.key = data.key;
        val.StartTime = new Date(val.StartTime);
        val.EndTime = new Date(val.EndTime);
        if (this.boundedEvents.find(e => e.Id === val.Id)) {
            this.boundedEvents[this.boundedEvents.findIndex(e => e.Id === val.Id )] = val;
            this.scheduleObj.refreshEvents();
        }
    }

    createServicesElement(args) {
        let row = document.createElement('div');
        row.className = 'custom-field-row';
        let formElement = args.element.querySelector('.e-schedule-form');
        formElement.firstChild.insertBefore(row, args.element.querySelector('.e-description-row'));
        let container = document.createElement('div');
        container.className = 'custom-field-container';
        let inputEle = document.createElement('input');
        inputEle.className = 'e-field';
        inputEle.name = 'Services'
        container.appendChild(inputEle);
        row.appendChild(container);
        this.multiSelectObj = new MultiSelectComponent({
            dataSource: [
                { text: 'Public Event', value: 'public-event' },
                { text: 'Maintenance', value: 'maintenance' },
                { text: 'Commercial Event', value: 'commercial-event' },
                { text: 'Family Event', value: 'family-event' }
            ],
            fields: { text: 'text', value: 'value' },
            value: [],
            mode: 'Box',
            //floatLabelType: 'Always', 
            placeholder: 'Services'
        });
        this.multiSelectObj.appendTo(inputEle);
        inputEle.setAttribute('name', 'Services');
    }

    createStaffElement(args) {
        let row = document.createElement('div');
        row.className = 'custom-field-row';
        let formElement = args.element.querySelector('.e-schedule-form');
        formElement.firstChild.insertBefore(row, args.element.querySelector('.e-description-row'));
        ReactDOM.render(<div className="custom-field-container">
            <div className="e-float-input">
                <input type="text" className="e-field" name="Staff" required />
                <span className="e-float-line"></span>
                <label className="e-float-text">Staff</label>
            </div>
        </div>, row);
    }

    onPopupOpen(args) {
        if (args.type === 'Editor') {
            let titleElement = args.element.querySelector('div.e-subject-container > div > label');
            titleElement.innerText = "Client";

            if (!args.element.querySelector('.custom-field-row')) {
                this.createServicesElement(args);
                this.createStaffElement(args);
            }

            if(args.data.Id) {
                this.multiSelectObj.value = args.data.Services.slice();
            } else {
                this.multiSelectObj.value = [];
            }

        }
    }
    
    change(args) {
        this.scheduleObj.selectedDate = args.value;
        this.scheduleObj.dataBind();
    }

    getAppointmentKey(data) {
        let found = this.boundedEvents.find(e => e.Id === data.Id);
        return found !== undefined ? found.key : firebase.database().ref('Appointments').push().key;
    }

    onActionBegin(args) {
        switch(args.requestType) {
            case 'eventCreate': case 'eventChange': {
                args.data.Services= this.multiSelectObj.value.slice();
                let appointmentKey = this.getAppointmentKey(args.data);
                let updates = {};
                updates['/Appointments/' + appointmentKey] = JSON.parse(JSON.stringify(args.data));
                updates['/User-Appointments/' + firebase.auth().currentUser.uid + '/' + appointmentKey] = JSON.parse(JSON.stringify(args.data));
                firebase.database().ref().update(updates);                    
                break;
            }
            case 'eventRemove': {
                args.data.forEach(e => {
                    firebase.database().ref('Appointments').child(e.key).remove();
                    firebase.database().ref('User-Appointments').child(firebase.auth().currentUser.uid).child(e.key).remove();    
                })
                break;
            }
        }
    }

    onActionComplete(args) {
        if (args.requestType === 'eventCreated') this.boundedEvents.pop();
    }

    onEventRendered(args) {
        let categoryColor;
        let start = new Date(args.data.StartTime).setHours(0, 0, 0, 0);
        let end = new Date(args.data.EndTime).setHours(0, 0, 0, 0);
        if (args.data.IsAllDay) {
            categoryColor = '#8e24aa';
        } else if (start !== end) {
            categoryColor = '#f57f17';
        } else {
            categoryColor = '#7fa900';
        }
        if (this.scheduleObj.currentView === 'Agenda') {
            (args.element.firstChild).style.borderLeftColor = categoryColor;
        } else {
            args.element.style.backgroundColor = categoryColor;
        }
    }

    render() {
        return (
            <div className='schedule-control-section'>
                <div className='col-lg-12 control-section'>
                    <div className='control-wrapper'>
                        <div className='col-md-8' style={{ float: 'left', paddingTop: '8px' }}><b>Appointments</b></div>
                        <div className='col-md-2' style={{ float: 'left', paddingTop: '8px' }}>
                            <label>Selected date:</label>
                        </div>
                        <div className='col-md-2' style={{ float: 'left', paddingTop: '8px' }}>
                            <DatePickerComponent value={new Date()} change={this.change.bind(this)}></DatePickerComponent>
                        </div>
                        <ScheduleComponent height='500px' selectedDate={new Date()} 
                            ref={schedule => this.scheduleObj = schedule} eventSettings={{ dataSource: this.boundedEvents }} 
                            popupOpen={this.onPopupOpen.bind(this)} 
                            actionBegin={this.onActionBegin.bind(this)}
                            actionComplete={this.onActionComplete.bind(this)}
                            eventRendered={this.onEventRendered.bind(this)}
                            >
                            <ViewsDirective>
                                <ViewsModelDirective option='Week' />
                                <ViewsModelDirective option='Agenda' />
                            </ViewsDirective>
                            <Inject services={[Week, Agenda]} />
                        </ScheduleComponent>
                    </div>
                </div>                
            </div>
        );
    }
}
export default Bookings;