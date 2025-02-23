import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebook, faTwitter } from '@fortawesome/free-brands-svg-icons';
import './Contactus.css'; // Assuming you have a CSS file for the styles

const Contactus = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(form);
  };

  return (
    <div>
      <header style={headerStyle}>
        <h1>Contact Us</h1>
      </header>
      <div className="container">
        <section className="contact-info">
          <h2>Contact Information</h2>
          <p><FontAwesomeIcon icon={faPhone} /> Mobile: +91 7238291064</p>
          <p><FontAwesomeIcon icon={faEnvelope} /> Email: careercomppass@gmail.com</p>
          <p><FontAwesomeIcon icon={faInstagram} /> Instagram: <a href="https://instagram.com/yourprofile" target="_blank" rel="noopener noreferrer">@yourprofile</a></p>
          <p><FontAwesomeIcon icon={faFacebook} /> Facebook: <a href="https://facebook.com/yourprofile" target="_blank" rel="noopener noreferrer">Your Profile</a></p>
          <p><FontAwesomeIcon icon={faTwitter} /> Twitter: <a href="https://twitter.com/yourprofile" target="_blank" rel="noopener noreferrer">@yourprofile</a></p>
        </section>
      </div>
      <div className="container">
        <section className="contact-form">
          <h2>Contact Us Form</h2>
          <form id="contactForm" onSubmit={handleSubmit}>
            <label htmlFor="name">Full Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit">Submit</button>
          </form>
        </section>
        <section className="praise-text">
          <h2>Why Choose Us?</h2>
          <p>
            At our career consulting website, we are committed to helping you
            achieve your professional dreams. With personalized guidance, expert
            advice, and a focus on your unique skills and goals, we empower you to
            take the next big step in your career journey. Let us help you unlock
            your true potential!
          </p>
        </section>
      </div>
    </div>
  );
};

const headerStyle = {
  backgroundColor: '#0073e6',
  color: 'white',
  padding: '20px',
  textAlign: 'center',
};

export default Contactus;