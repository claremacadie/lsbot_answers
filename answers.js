class App {
  constructor(url) {
    this.url = url;
    this.schedulesNum = 0;

    this.init();
    this.bind();
  }

  handleBtnAdd(event) {
    event.preventDefault();
    this.schedulesNum += 1;
    this.$schedulesDiv.insertAdjacentHTML('beforeend', this.scheduleFormHTML(this.schedulesNum));
  }

  formatData(serialisedData) {
    let data = [];

    for (let scheduleNum = 1; scheduleNum <= this.schedulesNum; scheduleNum++) {
      let obj = {
        "staff_id": Number(serialisedData[`staff_${scheduleNum}`]),
        "date": serialisedData[`date_${scheduleNum}`],
        "time": serialisedData[`time_${scheduleNum}`],
      };
      data.push(obj);
    }
    
    return {"schedules": data};
  }

  async sendScheduleData(formData) {
    let formPath = this.$schedulesForm.getAttribute('action');
    let formMethod = this.$schedulesForm.method;
    let data = JSON.stringify(this.formatData(formData));

    try {
      let response = await fetch(this.url + formPath, {
        'method': formMethod,
        'body': data,
        'headers': {
          'Content-Type': 'application/json',
        }
      });
      if (response.status === 400) throw new Error(await response.text());
      if (!response.ok) throw new Error(response.statusText);
      alert(await response.text());

    } catch(error) {
      alert(error);
    }
  }

  handleschedulesFormSubmit(event) {
    event.preventDefault();
   
    let formData = new FormData(this.$schedulesForm);
    let serialisedData = Object.fromEntries(formData.entries());
    if (Object.values(serialisedData).some(val => val === '')) {
      alert('Please check your inputs.');
    } else {
      this.sendScheduleData(serialisedData);
    }
  }

  async getStaffMembers() {
    let path = '/api/staff_members';

    try {
      let response = await fetch(this.url + path);
      if (!response.ok) throw new Error('Fetch request failed. Please try again.');

      return await response.json();
    } catch(error) {
      return error;
    }
  }

  async addStaffMembers() {
    try {
      this.staffMembers = await this.getStaffMembers();
      this.staffOptionsHTML = this.createStaffOptions();
    } catch(error) {
      alert(error);
    }
  }

  createStaffOptions() {
    let html = '';

    this.staffMembers.forEach(staffMember => {
      html += `<option value="${staffMember.id}">${staffMember.name}</option>`
    });

    return html;
  }

  scheduleFormHTML(scheduleNum) {
    return `
      <fieldset id="schedule_${scheduleNum}">
        <legend>Schedule ${scheduleNum}</legend>

        <div>
          <label for="staff_${scheduleNum}">Staff Name:</label>
          <select id="staff_${scheduleNum}" name="staff_${scheduleNum}">
            ${this.staffOptionsHTML}
          </select>
        </div>

        <div>
          <label for="date_${scheduleNum}">Date:</label>
          <input type="text" id="date_${scheduleNum}" name="date_${scheduleNum}" placeholder="mm-dd-yy">
        </div>

        <div>
          <label for="time_${scheduleNum}">Time:</label>
          <input type="text" id="time_${scheduleNum}" name="time_${scheduleNum}" placeholder="hh:mm">
        </div>

      </fieldset>
      `
  }

  init() {
    this.addStaffMembers();
    this.$schedulesDiv = document.getElementById('schedules');
    this.$btnAdd = document.getElementById('btnAdd');
    this.$schedulesForm = document.getElementById('schedules-form');
  }

  bind() {
    this.$btnAdd.addEventListener('click', this.handleBtnAdd.bind(this));
    this.$schedulesForm .addEventListener('submit', this.handleschedulesFormSubmit.bind(this));
  }
}

async function main() {
  let url = 'http://localhost:3000';
  let app = new App(url);
}

document.addEventListener('DOMContentLoaded', main);
