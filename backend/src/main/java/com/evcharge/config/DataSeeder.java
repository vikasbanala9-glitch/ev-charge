package com.evcharge.config;

import com.evcharge.model.*;
import com.evcharge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

/** Creates demo accounts and stations on first run (when the users table is empty). */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final StationRepository stations;
    private final ChargerRepository chargers;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (users.count() > 0) return;

        addUser("Admin", "admin@ev.com", "admin123", Role.ADMIN);
        addUser("Demo User", "user@ev.com", "user123", Role.USER);

        Station a = addStation("Madhapur Fast Hub", "Hitech City Road, Madhapur", "Hyderabad");
        Station b = addStation("Gachibowli Green Point", "Financial District, Gachibowli", "Hyderabad");
        Station c = addStation("Banjara Hills Plaza", "Road No. 12, Banjara Hills", "Hyderabad");

        addCharger(a, "A1", ChargerType.DC_FAST, "60", "240");
        addCharger(a, "A2", ChargerType.DC_FAST, "60", "240");
        addCharger(a, "A3", ChargerType.AC_FAST, "22", "120");
        addCharger(b, "B1", ChargerType.AC_FAST, "22", "110");
        addCharger(b, "B2", ChargerType.AC_SLOW, "7.4", "60");
        addCharger(c, "C1", ChargerType.DC_FAST, "120", "320");
        addCharger(c, "C2", ChargerType.AC_SLOW, "7.4", "70");
    }

    private void addUser(String n, String e, String p, Role r) {
        User u = new User();
        u.setName(n); u.setEmail(e); u.setPassword(encoder.encode(p)); u.setRole(r);
        users.save(u);
    }

    private Station addStation(String n, String a, String c) {
        Station s = new Station();
        s.setName(n); s.setAddress(a); s.setCity(c);
        return stations.save(s);
    }

    private void addCharger(Station s, String n, ChargerType t, String kw, String rate) {
        Charger c = new Charger();
        c.setStation(s); c.setName(n); c.setType(t);
        c.setPowerKw(new BigDecimal(kw)); c.setRatePerHour(new BigDecimal(rate));
        chargers.save(c);
    }
}
