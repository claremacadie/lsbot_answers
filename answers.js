class App {
  constructor(url) {
    this.url = url;
  }

  async fetchBookingDates(path) {
    try {
      let response = await fetch(this.url + path);
      if (!response.ok) {
        let responseText = await response.text();
      } else {
        this.bookingDates = await response.json();
      }
    } catch(error) {
      alert(error.message)
    }
  }

  async fetchBooking(path, bookingDate) {
    try {
      let response = await fetch(this.url + path + `/${bookingDate}`);
      if (!response.ok) {
        let responseText = await response.text();
        throw new Error(responseText)
      } else {
        let data = await response.json();
        return data;
      }
    } catch(error) {
      alert(error.message)
    }
  }

  async fetchBookings(path) {
    this.bookings = {};
    for (let i = 0; i < this.bookingDates.length; i++) {
      let bookingDate = this.bookingDates[i];
      let result = await this.fetchBooking(path, bookingDate);
      this.bookings[bookingDate] = result;
    }
  }

  displayBookings() {
    let div = document.getElementById('bookings');
    let list = document.createElement('ul');
    div.appendChild(list);

    Object.entries(this.bookings).forEach(datum => {
      let date = datum[0];
      let sessions = datum[1];
      let li = document.createElement('li');
      li.textContent = date;
      li.className = 'date';
      let ul = document.createElement('ul');
      ul.classList.add('hidden')
      li.append(ul);
      list.append(li);
      
      sessions.forEach(session => {
        let li = document.createElement('li');
        li.textContent = session.join(' | ');
        ul.appendChild(li);
      });

    });
    list.addEventListener('click', this.handleListClick.bind(this));
    console.log(list)
  }

  handleListClick(event) {
    event.preventDefault();
    let target = event.target;
    if (!target.classList.contains('date')) return;
    target.firstElementChild.classList.toggle('hidden');
  }
}

async function main() {
  let url = 'http://localhost:3000';
  let app = new App(url);

  await app.fetchBookingDates('/api/bookings');
  await app.fetchBookings('/api/bookings');
  app.displayBookings();
}

document.addEventListener('DOMContentLoaded', main);
