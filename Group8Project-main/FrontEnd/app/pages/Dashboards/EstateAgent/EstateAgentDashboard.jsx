/* =========================================================
   VALORA ESTATE AGENT DASHBOARD
========================================================= */

.estate-agent-dashboard-layout {
  min-height: 100vh;
  display: flex;
  background: #f5f3f7;
  color: #1f2933;
}


/* =========================================================
   MAIN
========================================================= */

.estate-agent-dashboard-main {
  width: calc(100% - 220px);
  min-height: 100vh;
  margin-left: 220px;
  padding: 30px 34px 45px;
}


/* =========================================================
   HEADER
========================================================= */

.estate-agent-dashboard-header {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 25px;
}

.estate-agent-dashboard-eyebrow {
  display: block;
  margin-bottom: 6px;
  color: #8f8498;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.estate-agent-dashboard-header h1 {
  margin: 0 0 7px;
  color: #2c2532;
  font-size: 25px;
  font-weight: 750;
  letter-spacing: -0.4px;
}

.estate-agent-dashboard-header p {
  margin: 0;
  color: #8d8492;
  font-size: 11px;
  line-height: 1.6;
}

.estate-agent-dashboard-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #563f6b;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
}


/* =========================================================
   STATS
========================================================= */

.estate-agent-dashboard-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.estate-agent-dashboard-stat-card {
  min-width: 0;
  min-height: 125px;
  padding: 18px;
  background: #ffffff;
  border: 1px solid #e5e0e9;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(40, 30, 50, 0.025);
}

.estate-agent-dashboard-stat-top {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 14px;
}

.estate-agent-dashboard-stat-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 7px;
  background: #eee8f2;
  color: #563f6b;
}

.estate-agent-dashboard-stat-top span {
  color: #857b8c;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.estate-agent-dashboard-stat-card > strong {
  display: block;
  color: #2d2633;
  font-size: 25px;
  font-weight: 750;
  line-height: 1;
}


/* =========================================================
   CONTENT
========================================================= */

.estate-agent-dashboard-content {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}


/* =========================================================
   CARDS
========================================================= */

.estate-agent-dashboard-card {
  min-width: 0;
  min-height: 240px;
  padding: 22px;
  background: #ffffff;
  border: 1px solid #e5e0e9;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(40, 30, 50, 0.025);
}


/* =========================================================
   CARD HEADER
========================================================= */

.estate-agent-dashboard-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.estate-agent-dashboard-card-header h2 {
  margin: 0 0 5px;
  color: #302837;
  font-size: 14px;
  font-weight: 750;
}

.estate-agent-dashboard-card-header p {
  margin: 0;
  color: #938a99;
  font-size: 9px;
  line-height: 1.5;
}

.estate-agent-dashboard-card-link {
  flex-shrink: 0;
  color: #563f6b;
  font-size: 9px;
  font-weight: 750;
  text-decoration: none;
}

.estate-agent-dashboard-card-link:hover {
  color: #463256;
  text-decoration: underline;
}


/* =========================================================
   EMPTY STATE
========================================================= */

.estate-agent-dashboard-empty-state {
  min-height: 145px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  border: 1px dashed #ddd5e2;
  border-radius: 8px;
  background: #faf9fb;
}

.estate-agent-dashboard-empty-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 9px;
  border-radius: 50%;
  background: #eee8f2;
  color: #563f6b;
}

.estate-agent-dashboard-empty-state h3 {
  margin: 0 0 5px;
  color: #4b4052;
  font-size: 10px;
  line-height: 1.5;
}

.estate-agent-dashboard-empty-state p {
  max-width: 410px;
  margin: 0;
  color: #968d9d;
  font-size: 8px;
  line-height: 1.6;
}


/* =========================================================
   AGENT ACTIONS
========================================================= */

.estate-agent-dashboard-actions-card {
  min-height: auto;
}

.estate-agent-dashboard-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.estate-agent-dashboard-action {
  min-width: 0;
  min-height: 55px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e9e4ed;
  border-radius: 8px;
  background: #faf9fb;
  color: #504558;
  font-size: 9px;
  font-weight: 650;
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.estate-agent-dashboard-action:hover {
  background: #f4f0f6;
  border-color: #dcd2e2;
  transform: translateY(-1px);
}

.estate-agent-dashboard-action-icon {
  width: 29px;
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 6px;
  background: #eee8f2;
  color: #563f6b;
}


/* =========================================================
   ANNOUNCEMENTS
========================================================= */

.estate-agent-dashboard-announcement-empty {
  min-height: 80px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 1px solid #eeeaf1;
  border-radius: 8px;
  background: #faf9fb;
}

.estate-agent-dashboard-announcement-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: #eee8f2;
  color: #563f6b;
}

.estate-agent-dashboard-announcement-empty span {
  color: #766c7e;
  font-size: 9px;
  font-weight: 650;
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {

  .estate-agent-dashboard-main {
    width: calc(100% - 200px);
    margin-left: 200px;
  }

  .estate-agent-dashboard-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

}


@media (max-width: 800px) {

  .estate-agent-dashboard-main {
    width: calc(100% - 170px);
    margin-left: 170px;
    padding: 25px 22px 40px;
  }

  .estate-agent-dashboard-header {
    align-items: flex-start;
  }

  .estate-agent-dashboard-avatar {
    display: none;
  }

  .estate-agent-dashboard-content {
    grid-template-columns: 1fr;
  }

}


@media (max-width: 600px) {

  .estate-agent-dashboard-layout {
    display: block;
  }

  .estate-agent-dashboard-main {
    width: 100%;
    margin-left: 0;
    padding: 22px 14px 35px;
  }

  .estate-agent-dashboard-header h1 {
    font-size: 21px;
  }

  .estate-agent-dashboard-stats {
    grid-template-columns: 1fr;
  }

  .estate-agent-dashboard-actions {
    grid-template-columns: 1fr;
  }

}


@media (max-width: 430px) {

  .estate-agent-dashboard-main {
    padding: 18px 11px 30px;
  }

  .estate-agent-dashboard-card {
    padding: 17px;
  }

  .estate-agent-dashboard-stat-card {
    padding: 16px;
  }

}
