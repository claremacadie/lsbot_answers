class App {
  constructor(url) {
    this.url = url;
  }

  setTimeoutPromise(delay) {
    return new Promise((_, reject) => setTimeout(() => reject(new TimeoutError()), delay));
  }

  async fetchSchedules(path) {
    try {
      let response = await Promise.race([fetch(this.url + path), this.setTimeoutPromise(10000)]);

      if (!response.ok) throw new Error('Reponse not ok');
      this.schedules = await response.json();

    } catch (error) {
      alert(error);
      alert('Request failed.');
    }
  }

  createBookingForm() {
    this.$form = document.createElement('form');
    this.$bookingFormDiv = document.getElementById("booking-form");
    this.$bookingFormDiv.insertAdjacentElement('afterbegin', this.$form);

    let scheduleSelectLabel = document.createElement('label');
    scheduleSelectLabel.textContent = 'Please select one schedule:';
    scheduleSelectLabel.setAttribute('for', 'scheduleSelect');

    let scheduleSelect = document.createElement('select');
    scheduleSelect.id = 'scheduleSelect';
    scheduleSelect.setAttribute('name', 'id');
    this.schedules.forEach(schedule => {
      if (!schedule['student_email']) {
        let option = `<option value=${schedule.id}>${this.staffMembers[schedule.staff_id]} | ${schedule.date} | ${schedule.time}</option>`;
        scheduleSelect.insertAdjacentHTML('beforeend', option);
      }
    });
    
    let emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email';
    let emailInput = document.createElement('input');
    emailInput.setAttribute('type', 'text');
    emailInput.setAttribute('name', 'student_email');
    emailInput.required;
    emailLabel.append(emailInput);

    let submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.setAttribute('type', 'submit');

    this.$form.append(scheduleSelectLabel, scheduleSelect, emailLabel, submitButton);
    this.$form.addEventListener('submit', this.handleBookingForm.bind(this));
  }

  async fetchStaff(path) {
    try {
      let response = await fetch(this.url + path);
      if (!response.ok) throw Error('Fetch went wrong. Please refresh the page.');

      let data = await response.json();
      this.staffMembers = {};
      data.forEach(member => {
        this.staffMembers[member.id] = member.name;
      });
    } catch(error) {
      alert(error);
    }
  }

  async handleBookingForm(event) {
    event.preventDefault();
    let formData = new FormData(this.$form);
    let jsonFormData = Object.fromEntries(formData.entries());
    if (Object.values(formData).some(val => val === '')) {
      alert('Please ensure inputs are valid');
    } else {
      let dataToSend = JSON.stringify(jsonFormData);
      console.log(dataToSend)
      try {
        let response = await fetch(this.url + '/api/bookings', {
          'method': 'post',
          'body': dataToSend,
          'headers': {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          alert('Booked!');
        } else {
          let responseText = await response.text();
          if (responseText.split(';')[0] === 'Student does not exist') {
            let bookingId = responseText.split(';')[1].split(':')[1].trim();
            this.createStudentForm(bookingId, jsonFormData['email']);
          } else {
            throw new Error(responseText);
          }
        }
      } catch(error) {
        alert(error);
      }
    }
  }

  createStudentForm(bookingId, studentEmail) {
    this.$studentForm = document.createElement('form');
    this.$studentFormDiv = document.getElementById('student-form');
    this.$studentFormDiv.append(this.$studentForm);

    let emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email: ';
    emailLabel.setAttribute('for', 'email');
    let emailInput = document.createElement('input');
    emailInput.setAttribute('id', 'email');
    emailInput.setAttribute('name', 'email');
    emailInput.setAttribute('type', 'email');
    emailInput.setAttribute('value', studentEmail);
    emailLabel.append(emailInput);

    let nameLabel = document.createElement('label');
    nameLabel.textContent = 'Name: ';
    nameLabel.setAttribute('for', 'name');
    let nameInput = document.createElement('input');
    nameInput.setAttribute('id', 'name');
    nameInput.setAttribute('name', 'name');
    nameInput.setAttribute('type', 'text');
    nameLabel.append(nameInput);
  

    let bookingLabel = document.createElement('label');
    bookingLabel.textContent = 'Booking reference: ';
    bookingLabel.setAttribute('for', 'booking_id');
    let bookingInput = document.createElement('input');
    bookingInput.setAttribute('id', 'booking_id');
    bookingInput.setAttribute('name', 'booking_sequence');
    bookingInput.setAttribute('type', 'text');
    bookingInput.setAttribute('value', bookingId);
    bookingLabel.append(bookingInput);

    let button = document.createElement('button');
    button.textContent = 'Submit';
    button.setAttribute('type', 'submit');

    this.$studentForm.append(emailLabel, nameLabel, bookingLabel, button);

    this.$studentForm.addEventListener('submit', this.handleStudentForm.bind(this));
  }

  async handleStudentForm(event) {
    event.preventDefault();
    let formData = new FormData(this.$studentForm);
    let jsonData = Object.fromEntries(formData.entries());
    
    if (Object.values(jsonData).some(val => val === '')) {
      alert('Please ensure inputs are valid');
    } else {
      let dataToSend = JSON.stringify(jsonData);
      console.log(dataToSend)
      try {
        let response = await fetch(this.url + '/api/students', {
          'method': 'post',
          'body': dataToSend,
          'headers': {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          let responseText = await response.text();
          throw new Error(responseText);
        }

        let message = await response.text();
        alert(message);
        alert('Booked!');
      } catch(error) {
        alert(error);
      }
    }
  }
}

async function main() {
  let url = 'http://localhost:3000';
  let app = new App(url);

  await app.fetchSchedules('/api/schedules');
  await app.fetchStaff('/api/staff_members');
  app.createBookingForm();
}

document.addEventListener('DOMContentLoaded', main);

/*

*/
