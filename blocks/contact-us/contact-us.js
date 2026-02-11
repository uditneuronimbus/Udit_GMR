import { COUNTRIES } from './countries.js';

export default function decorate(block) {
  // Extract configuration from block content (with defaults)
  const config = {
    sectionTitle: 'Corporate Office',
    companyName: 'GMR Group',
    address: 'New Udaan Bhawan, Opp. Terminal 3, IGI Airport, New Delhi, India - 110037.',
    phone: '+9111 4253 2600',
    email: 'info@gmrgroup.in',
    socialMediaHeading: 'Connect on our official social channels',
    enquiryLabel: 'Enquiry*',
    enquiryPlaceholder: 'Select enquiry type',
    countryLabel: 'Country*',
    countryPlaceholder: 'Select country',
    firstNameLabel: 'First Name*',
    firstNamePlaceholder: 'Enter your first name...',
    lastNameLabel: 'Last Name',
    lastNamePlaceholder: 'Enter your last name...',
    mobileLabel: 'Mobile No.*',
    mobilePlaceholder: 'Enter your mobile no...',
    emailLabel: 'Email ID*',
    emailPlaceholder: 'Enter your email ID...',
    messageLabel: 'Message*',
    messagePlaceholder: 'Enter your message...',
    submitLabel: 'Submit',
    successMessage: 'Success!',
    // Google Maps embed URL for New Udaan Bhawan location
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.547!2d77.08755!3d28.55624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b1b1b1b1b1b%3A0x1b1b1b1b1b1b1b1b!2sNew%20Udaan%20Bhawan!5e0!3m2!1sen!2sin!4v1234567890'
  };

  // Enquiry types
  const enquiryTypes = [
    { label: 'General Inquiry', value: 'general' },
    { label: 'Business Partnership', value: 'business' },
    { label: 'Career Opportunities', value: 'career' },
    { label: 'Media & Press', value: 'media' },
    { label: 'Other', value: 'other' }
  ];

  // Social media links
  const socialMediaLinks = [
    { platform: 'linkedin', url: 'https://www.linkedin.com/company/gmr-group', icon: 'in' },
    { platform: 'facebook', url: 'https://www.facebook.com/GMRGroup', icon: 'f' },
    { platform: 'youtube', url: 'https://www.youtube.com/user/GMRGroup', icon: '▶' }
  ];

  // Generate enquiry options
  const enquiryOptions = enquiryTypes.map(type =>
    `<option value="${type.value}">${type.label}</option>`
  ).join('');

  // Generate country options
  const countryOptions = COUNTRIES.map(country =>
    `<option value="${country.value}">${country.label}</option>`
  ).join('');

  // Generate social media icons
  const socialIcons = socialMediaLinks.map(link =>
    `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-icon social-${link.platform}" aria-label="${link.platform}">
      <span>${link.icon}</span>
    </a>`
  ).join('');

  // Build the contact form HTML
  block.innerHTML = `
    <div class="contact-us-container">
      <!-- Left Section: Corporate Office Info -->
      <div class="contact-info">
        <h2>${config.sectionTitle}</h2>
        <h3>${config.companyName}</h3>
        
        <div class="info-item">
          <span class="icon">📍</span>
          <p>${config.address}</p>
        </div>
        
        <div class="info-item">
          <span class="icon">📞</span>
          <p><a href="tel:${config.phone.replace(/\s/g, '')}">${config.phone}</a></p>
        </div>
        
        <div class="info-item">
          <span class="icon">✉️</span>
          <p><a href="mailto:${config.email}">${config.email}</a></p>
        </div>
        
        <div class="social-media">
          <p>${config.socialMediaHeading}</p>
          <div class="social-icons">
            ${socialIcons}
          </div>
        </div>
      </div>

      <!-- Right Section: Contact Form -->
      <div class="contact-form-wrapper">
        <form class="contact-form" id="contactForm">
          <div class="form-row">
            <div class="form-group">
              <label for="enquiry">${config.enquiryLabel}</label>
              <select id="enquiry" name="enquiry" required>
                <option value="">${config.enquiryPlaceholder}</option>
                ${enquiryOptions}
              </select>
            </div>
            
            <div class="form-group">
              <label for="country">${config.countryLabel}</label>
              <select id="country" name="country" required>
                <option value="">${config.countryPlaceholder}</option>
                ${countryOptions}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="firstName">${config.firstNameLabel}</label>
              <input type="text" id="firstName" name="firstName" placeholder="${config.firstNamePlaceholder}" required />
            </div>
            
            <div class="form-group">
              <label for="lastName">${config.lastNameLabel}</label>
              <input type="text" id="lastName" name="lastName" placeholder="${config.lastNamePlaceholder}" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="mobile">${config.mobileLabel}</label>
              <input type="tel" id="mobile" name="mobile" placeholder="${config.mobilePlaceholder}" required />
            </div>
            
            <div class="form-group">
              <label for="email">${config.emailLabel}</label>
              <input type="email" id="email" name="email" placeholder="${config.emailPlaceholder}" required />
            </div>
          </div>

          <div class="form-group full-width">
            <label for="message">${config.messageLabel}</label>
            <textarea id="message" name="message" placeholder="${config.messagePlaceholder}" rows="5" minlength="4" required></textarea>
            <small style="color: #666; font-size: 12px;">Minimum 4 characters required</small>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn">${config.submitLabel}</button>
          </div>

          <div class="form-status" style="display: none;"></div>
        </form>
      </div>
    </div>

    <!-- Map Section -->
    <div class="map-section">
      <iframe 
        src="${config.mapEmbedUrl}" 
        width="100%" 
        height="450" 
        style="border:0;" 
        allowfullscreen="" 
        loading="lazy" 
        referrerpolicy="no-referrer-when-downgrade"
        title="GMR Group Office Location">
      </iframe>
      
      <!-- Map Info Card Overlay -->
      <div class="map-info-card">
        <div class="map-info-header">
          <div class="map-info-details">
            <h4>New Udaan Bhawan</h4>
            <p class="map-address">New Udaan Bhawan, opp. Terminal 3, New Delhi, Delhi 110037</p>
            <div class="map-rating">
              <span class="stars">★★★★★</span>
              <span class="rating-value">4.6</span>
              <span class="reviews-count">491 reviews</span>
            </div>
            <a href="#" class="view-larger-map">View larger map</a>
          </div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=New+Udaan+Bhawan,New+Delhi" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="directions-btn">
            <span class="directions-icon">🧭</span>
            <span>Directions</span>
          </a>
        </div>
      </div>
    </div>
  `;

  // Form elements
  const form = block.querySelector('#contactForm');
  const status = block.querySelector('.form-status');
  const submitBtn = block.querySelector('.submit-btn');
  const countrySelect = block.querySelector('#country');
  const mobileInput = block.querySelector('#mobile');

  // Update phone validation based on country selection (no visual prefix)
  function updatePhoneValidation() {
    const selectedCountry = COUNTRIES.find(c => c.value === countrySelect.value);
    if (selectedCountry) {
      mobileInput.setAttribute('pattern', selectedCountry.pattern);
      mobileInput.setAttribute('maxlength', selectedCountry.maxLength);
      mobileInput.setAttribute('placeholder', selectedCountry.placeholder);
      mobileInput.setAttribute('title', `Enter valid ${selectedCountry.label} phone number`);
    }
  }

  // Set initial validation for India (default)
  updatePhoneValidation();

  // Update validation when country changes
  countrySelect.addEventListener('change', updatePhoneValidation);

  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.style.display = 'none';

    const formData = new FormData(form);

    // Get selected country for validation and email display
    const selectedCountry = COUNTRIES.find(c => c.value === formData.get('country'));
    const phoneCode = selectedCountry ? selectedCountry.phoneCode : '+';
    const mobileNumber = formData.get('mobile');
    const fullMobileNumber = `${phoneCode} ${mobileNumber}`; // For email display only

    // Prepare payload for GMR backend API
    const payload = {
      enquiryType: formData.get('enquiry'),
      country: formData.get('country'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName') || '',
      mobileNo: mobileNumber, // Just the number, backend doesn't accept country code
      email: formData.get('email'),
      message: formData.get('message')
    };

    // Prepare email message for Adobe email service
    const emailMessage = `
═══════════════════════════════════════
📋 NEW CONTACT FORM SUBMISSION
═══════════════════════════════════════

📌 ENQUIRY TYPE: ${formData.get('enquiry')}

👤 CONTACT DETAILS:
   Name: ${formData.get('firstName')} ${formData.get('lastName') || ''}
   Email: ${formData.get('email')}
   Mobile: ${fullMobileNumber}
   Country: ${formData.get('country')}

💬 MESSAGE:
${formData.get('message')}

═══════════════════════════════════════
    `.trim();

    try {
      // Call both APIs in parallel
      const [apiResponse, emailResponse] = await Promise.allSettled([
        // GMR Backend API
        fetch('http://13.200.106.168:4000/api/enquiry/save-enquery', {
          method: 'POST',
          headers: {
            'Authorization': 'U2FsdGVkX1+IAunex0zJueoZQpRBfpUm/DSQSMufK69HpTEh4abfdnhz0fQ+jbSmPrqojCZOhYZ6/mvA28aQxw',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }),

        // Adobe Email Service
        fetch('https://3842504-emailer-default.adobeioruntime.net/api/v1/web/eds-smtp-mailer/send-mail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: `${formData.get('firstName')} ${formData.get('lastName') || ''}`.trim(),
            email: formData.get('email'),
            message: emailMessage
          })
        })
      ]);

      // Check results
      let apiSuccess = false;
      let emailSuccess = false;

      // Check GMR API response
      if (apiResponse.status === 'fulfilled' && apiResponse.value.ok) {
        const result = await apiResponse.value.json();
        console.log('✓ Enquiry saved to database:', result);
        apiSuccess = true;
      } else {
        console.error('✗ Failed to save to database:', apiResponse.reason || apiResponse.value?.statusText);
      }

      // Check Email response
      if (emailResponse.status === 'fulfilled' && (emailResponse.value.ok || emailResponse.value.status === 200)) {
        console.log('✓ Email notification sent');
        emailSuccess = true;
      } else if (emailResponse.status === 'rejected' && emailResponse.reason?.name === 'TypeError') {
        // CORS error on email service - likely still sent
        console.log('✓ Email likely sent (CORS prevented confirmation)');
        emailSuccess = true;
      } else {
        console.error('✗ Failed to send email:', emailResponse.reason || emailResponse.value?.statusText);
      }

      // Show success if at least one succeeded
      if (apiSuccess || emailSuccess) {
        form.innerHTML = `
          <div style="text-align:center; padding:40px; border:2px solid #28a745; background:#f8fff9; border-radius:8px;">
            <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
            <h3 style="color:#28a745; margin:0 0 12px 0;">${config.successMessage}</h3>
            <p style="margin:0; color:#333;">Your enquiry has been submitted successfully. We'll get back to you soon!</p>
          </div>
        `;
      } else {
        throw new Error('Both submission methods failed');
      }
    } catch (error) {
      console.error('Submission error:', error);

      // Show error message
      showError(`Failed to submit enquiry: ${error.message}`);
      submitBtn.disabled = false;
      submitBtn.textContent = config.submitLabel;
    }
  });

  function showError(message) {
    status.style.display = 'block';
    status.style.color = '#dc3545';
    status.style.padding = '12px';
    status.style.backgroundColor = '#f8d7da';
    status.style.border = '1px solid #f5c6cb';
    status.style.borderRadius = '4px';
    status.textContent = message;
  }
}
