# Flipkart Clone - MERN Stack

Full-Stack Flipkart with Admin Dashboard & Paytm Payment Gateway.

[Visit Now](https://flipkartweb-mern.vercel.app) 🚀

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- **Node.js** (v14 or higher)
- **NPM** (v6 or higher)
- **PostgreSQL** (Local or Cloud instance like Neon)
- **Cloudinary Account** (For image storage)
- **SendGrid Account** (For email services)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jigarsable/flipkart-mern.git
   cd flipkart-mern
   ```

2. **Install Root Dependencies:**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   npm install --prefix frontend
   ```

### Configuration

Create a `config.env` file inside `backend/config/` directory and add the following environment variables:

```env
PORT=4000
NODE_ENV=development

DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
COOKIE_EXPIRE=5

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_MAIL=your_verified_sendgrid_email

# Paytm (Optional for Local testing)
PAYTM_MID=your_paytm_mid
PAYTM_WEBSITE=your_paytm_website
PAYTM_CHANNEL_ID=your_paytm_channel_id
PAYTM_INDUSTRY_TYPE=your_paytm_industry_type
PAYTM_CUST_ID=your_paytm_cust_id
PAYTM_MERCHANT_KEY=your_paytm_merchant_key
```

### Running the Application

To run both the frontend and backend concurrently in development mode, use:

```bash
npm run dev
```

The application will be available at:
- **Frontend:** `http://localhost:3000`
- **Backend:** `http://localhost:4000`

---

## 🖥️ Tech Stack
**Frontend:**

![reactjs](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)&nbsp;
![react-router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)&nbsp;
![redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)&nbsp;
![tailwindcss](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)&nbsp;
![mui](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)&nbsp;
![chart-js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)&nbsp;

**Backend:**

![nodejs](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)&nbsp;
![expressjs](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)&nbsp;
![postgresql](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)&nbsp;
![jwt](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)&nbsp;

**Payment Gateway:**

![paytm](https://img.shields.io/badge/Paytm-002970?style=for-the-badge&logo=paytm&logoColor=00BAF2)

**Cloud Storage:** [Cloudinary](https://cloudinary.com/)

**Mail Service:** [Sendgrid](https://sendgrid.com/)

---

## 🚀 Features

**User Account Management**
- Login/Signup: 🚪 Users can create an account or log in to an existing one.
- Update Profile/Password: 🔐 Users can update their profile information and change their passwords.
  
**Password Management**
- Reset Password Mail: 📧 Utilizing Sendgrid, users can reset their passwords via email.
  
**Shopping Cart**
- Add/Remove Items: 🛒 Users can add items to their shopping cart or remove them as needed.
- Update Quantities: 🔢 Quantities of items in the cart can be adjusted.
  
**Saved Items**
- Save For Later: 💾 Users can move items from the cart to a "Saved For Later" list or remove them from it.
  
**Wishlist**
- Add/Remove Items: ❤️ Users can add items to their wishlist or remove them from it.
  
**Product Browsing**
- Pagination: 📚 Products are paginated, with 12 products displayed per page by default.
- Search: 🔍 Users can search for products.
- Filters: 🎛️ Products can be filtered based on categories, ratings, and price range.
  
**Checkout Process**
- Shipping Info: 🚚 Shipping information is stored in session storage for ease of checkout.
- Payment Options: 💳 Users can pay through Paytm payment gateway for checkout.
  
**Order Management**
- My Orders: 📦 Users can view their order history with various filters.
- Order Details: ℹ️ Details of all ordered items are accessible.
- Order Confirmation: ✉️ Users receive email notifications with comprehensive order details upon placing an order.
  
**Product Interaction**
- Review Products: 🌟 Users can review products.
  
**Admin Features**
- Dashboard: 🖥️ Admins have access to a dedicated dashboard.
- Order Management: 📊 Admins can update order statuses and delete orders.
- Product Management: 📝 Admins can add/update products.
- User Management: 👥 Admins can update user data and delete users.
- Review Management: 📜 Admins can view and delete product reviews.
- Stock Management: 📉 Product stock is automatically decreased upon shipment.

---

## Sneak Peek of Admin Dashboard 🙈 :
![Capture](https://user-images.githubusercontent.com/64949957/153995268-0cb769b9-e0ee-48ea-83c1-09b881df4101.PNG)

<table>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/64949957/153995383-367cbcc0-cce5-4523-a999-b8d92e44d6ab.jpg" alt="mockup" /></td>
    <td><img src="https://user-images.githubusercontent.com/64949957/153995406-45e36cbc-8d42-4416-b23a-08ad592e4ebc.jpg" alt="mockups" /></td>
  </tr>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/64949957/153996560-bd631f30-46f0-4248-83b3-d8ce44a8f9e4.PNG" alt="mockup" /></td>
    <td><img src="https://user-images.githubusercontent.com/64949957/153996577-57b1a82d-064a-49dc-9055-e2bceb854ab2.PNG" alt="mockups" /></td>
  </tr>
</table>

---

<h2>📬 Contact</h2>

Feel free to reach me through the below handles if you'd like to contact me.

[![linkedin](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jigar-sablee)
[![instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/jigarsable.dev)

