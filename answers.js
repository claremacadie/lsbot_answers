class App {
  constructor(url) {
    this.url = url;
    this.schedules = [];
    this.schedulesTally = {};
  }

  setTimeoutPromise(delay) {
    return new Promise((_, reject) => setTimeout(() => reject('Request timed out. Please try again.'), delay));
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
      alert('No schedules are available for booking');
    } else {
      this.createSchedulesTally();
      let msg = '';
      for (let staffId in this.schedulesTally) {
        msg += `${staffId}: ${this.schedulesTally[staffId]}\n`;
      }
      alert(msg);
    }
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
}

async function main() {
  let url = 'http://localhost:3000/';
  let app = new App(url);
  await app.fetchSchedules('api/schedules');
}

document.addEventListener('DOMContentLoaded', main);
