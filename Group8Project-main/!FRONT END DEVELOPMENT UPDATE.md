# Frontend Development Update

## What we did

We cleaned up the frontend. The project had two or three copies of the same screens, so we deleted the
old ones and kept one set of pages, one login and one set of styles. There is now one frontend to work
on instead of three.

## Where it stands

- The frontend is connected to the backend. Login, registration, roles, complaints and the dashboards
  run on the real backend, with real accounts and real data.
- Every user goes to their own dashboard and cannot open another role's pages.
- We removed the old pop-up alerts and confirm boxes and put the messages inside the page instead. Each
  page also says plainly when it is loading, empty or has a problem.
- Tests and the build pass.

## Still missing on the backend

These screens are built, but the backend does not have the endpoints they need yet. Until it does, they
keep their data in the browser, so that data is not shared between users:

- User admin: the list of users, and approving or rejecting new sign-ups.
- Property sale and rent requests, and the HOA steps that approve a listing.
- Photo uploads for listings and complaints.
- Resident directory, and a way to know which unit belongs to the signed-in user.
- Buyer and agent enquiries.
- A login for service providers.
- Analytics other than the Living Score.

## Still to do on the frontend

- Some pages still show placeholder numbers and example records.
- A few screens need a design pass, especially on smaller screens.
- Assets: a proper logo image and page icons.

## Can we show it?

Yes. The system can be shown to Sir. Login, roles, complaints and the dashboards work end to end on the
real backend, and the lists above are the known gaps.
