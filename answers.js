class TimeoutError extends Error {
  constructor(message = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

class App {
  constructor(url) {
    this.url = url;
    this.schedules = [];
    this.schedulesTally = {};

    this.init();
    this.bind();
  }

  setTimeoutPromise(delay) {
    return new Promise((_, reject) => setTimeout(() => reject(new TimeoutError()), delay));
  }

  async fetchSchedules(path) {
    try {
      let response = await Promise.race([fetch(this.url + path), this.setTimeoutPromise(5000)]);

      if (!response.ok) throw new Error('Reponse not ok');
      this.schedules = await response.json();
      this.displaySchedules();
      alert('Request completed successfully.');

    } catch (error) {
      alert(error);
      alert('Request failed.');
    }
  }

  displaySchedules() {
    if (this.schedules.length === 0) {
      alert('There are currently no schedules available for booking');
    } else {
      this.createSchedulesTally();
      let msg = '';
      for (let staffId in this.schedulesTally) {
        msg += `${staffId}: ${this.schedulesTally[staffId]}\n`;
      }
      alert(msg);
    }
  }

  async sendFetch(data) {
    let formPath = this.$staffForm.getAttribute('action');
    let formMethod = this.$staffForm.method;

    return await fetch(this.url + formPath, {
        'method': formMethod,
        'body': data,
        'headers': {
          'Content-Type': 'application/json',
        }
      });
  }

  createSchedulesTally() {
    this.schedules.forEach(schedule => {
      let staffId = `Staff ${schedule.staff_id}`;
      if (this.schedulesTally[staffId]) {
        this.schedulesTally[staffId] += 1;
      } else {
        this.schedulesTally[staffId] = 1;
      }
    });
  }

  async createNewStaff(inputEmail, inputName) {
    let data = JSON.stringify({'email': inputEmail, 'name': inputName});

    try {
      let response = await this.sendFetch(data);

      if (!response.ok) throw new Error('Response not ok');
      if(response.status >= 400 && response.status < 500) throw new Error('Staff can not be created. Check your inputs.');

      let id = (await response.json()).id;
      alert(`Successfully created staff with id: ${id}`);
    } catch(error) {
      alert(error);
    }
  }

  async handleStaffFormSubmit(event) {
    event.preventDefault();

    let inputEmail = this.$staffForm.email.value.trim();
    let inputName = this.$staffForm.name.value.trim();
    if (!inputEmail || !inputName) {
      alert('Staff cannot be created. Check your inputs.');
    } else {
      let id = await this.createNewStaff(inputEmail, inputName);
    }
  }

  init() {
    this.$staffForm = document.getElementById('staff-form');
  }

  bind() {
    this.$staffForm.addEventListener('submit', this.handleStaffFormSubmit.bind(this));
  }
}

async function main() {
  let url = 'http://localhost:3000';
  let app = new App(url);
  // await app.fetchSchedules('/api/schedules');
}

document.addEventListener('DOMContentLoaded', main);
