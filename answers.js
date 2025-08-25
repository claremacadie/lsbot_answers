class App {
  constructor(url) {
    this.url = url;
  }

  createForm(formType) {
    let form = document.createElement('form');
    let label = document.createElement('label');
    label.textContent = `Enter the schedule id of the ${formType} you wish to cancel:`;
    let input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('name', 'id');
    label.append(input);
    let button = document.createElement('button');
    button.textContent = `Cancel ${formType}`;
    button.setAttribute('type', 'submit');

    form.append(label, button);
    return form;
  }

  createForms() {
    this.bookingsDiv = document.getElementById('cancel_bookings');
    this.schedulesDiv = document.getElementById('cancel_schedules');

    let bookingForm = this.createForm('Booking');
    bookingForm.setAttribute('action', '/api/bookings/');
    bookingForm.setAttribute('method', 'PUT');
    bookingForm.addEventListener('submit', this.handleCancelBooking.bind(this));
    this.bookingsDiv.append(bookingForm);
    
    let scheduleForm = this.createForm('Schedule');
    scheduleForm.setAttribute('action', '/api/schedules/');
    scheduleForm.setAttribute('method', 'DELETE');
    scheduleForm.addEventListener('submit', this.handleCancelSchedule.bind(this));
    this.schedulesDiv.append(scheduleForm);
  }

  async handleCancelBooking(event) {
    event.preventDefault();
    let form = event.target
    let booking_id = form.id.value;
    try {
      let response = await fetch(this.url + form.getAttribute('action') + booking_id, {
        'method': form.getAttribute('method'),
      });
      
      if (!response.ok) {
        let responseText = await response.text();
        throw new Error(responseText);
      }

      alert('Booking cancelled');

    } catch(error) {
      alert(error.message)
    }
  }

  async handleCancelSchedule(event) {
    event.preventDefault();
    let form = event.target
    let schedule_id = form.id.value;
    try {
      let response = await fetch(this.url + form.getAttribute('action') + schedule_id, {
        'method': form.getAttribute('method'),
      });
      
      if (!response.ok) {
        let responseText = await response.text();
        throw new Error(responseText);
      }

      alert('Schedule cancelled');
      
    } catch(error) {
      alert(error.message)
    }
  }
}

async function main() {
  let url = 'http://localhost:3000';
  let app = new App(url);

  app.createForms();
}

document.addEventListener('DOMContentLoaded', main);
