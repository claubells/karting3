package com.example.karting3;

import com.example.karting3.entities.*;
import com.example.karting3.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final RatesLapsRepository ratesLapsRepository;
    private final KartRepository kartRepository;
    private final LoyaltyDiscountRepository loyaltyRepository;
    private final ReservationHourRepository reservationHourRepository;
    private final PeopleDiscountRepository peopleRepository;
    private final HolidayRepository holidayRepository;
    private final BirthdayRepository birthdayRepository;

    private static final String STATUS_AVAILABLE = "Available";
    private static final String MODEL = "Sodikart RT8";

    public DataLoader(RatesLapsRepository ratesLapsRepository, KartRepository kartRepository, LoyaltyDiscountRepository loyaltyRepository, ReservationHourRepository reservationHourRepository, PeopleDiscountRepository peopleRepository, HolidayRepository holidayRepository, BirthdayRepository birthdayRepository) {
        this.ratesLapsRepository = ratesLapsRepository;
        this.kartRepository = kartRepository;
        this.loyaltyRepository = loyaltyRepository;
        this.reservationHourRepository = reservationHourRepository;
        this.peopleRepository = peopleRepository;
        this.holidayRepository = holidayRepository;
        this.birthdayRepository = birthdayRepository;
    }

    @Override
    public void run(String... args) {

        ratesLoad();
        kartsLoad();
        loyaltyDiscountLoad();
        reservationHourLoad();
        peopleLoad();
        birthdayLoad();
        holidayLoad();
    }

    private void ratesLoad(){
        if (ratesLapsRepository.count() == 0) {
            List<RatesLapsEntity> lapsRates = List.of(
                    new RatesLapsEntity(null, 10, 15000),
                    new RatesLapsEntity(null, 15, 20000),
                    new RatesLapsEntity(null, 20, 25000)
            );

            ratesLapsRepository.saveAll(lapsRates);
            System.out.println("✅ Tarifas por cantidad de vueltas precargadas.");
        }
    }

    private void kartsLoad(){
        if (kartRepository.count() == 0) {
            List<KartEntity> karts = List.of(
                    new KartEntity(null, "K001", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K002", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K003", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K004", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K005", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K006", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K007", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K008", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K009", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K010", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K011", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K012", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K013", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K014", MODEL, STATUS_AVAILABLE),
                    new KartEntity(null, "K015", MODEL, STATUS_AVAILABLE)
            );
            kartRepository.saveAll(karts);
            System.out.println("✅ Karts precargados.");
        }
    }

    private void loyaltyDiscountLoad(){
        if (loyaltyRepository.count() == 0) {
            List<LoyaltyDiscountEntity> discounts = List.of(
                    new LoyaltyDiscountEntity(null, 0, 0), //sin descuento
                    new LoyaltyDiscountEntity(null, 1, 0),
                    new LoyaltyDiscountEntity(null, 2,0.1),// 10% entre 2 a 4 veces
                    new LoyaltyDiscountEntity(null, 3,0.1),
                    new LoyaltyDiscountEntity(null, 4,0.1),
                    new LoyaltyDiscountEntity(null, 5,0.2), // 20% entre 5 y 6 visitas
                    new LoyaltyDiscountEntity(null, 6,0.2),
                    new LoyaltyDiscountEntity(null, 7,0.3) //30% de 7 o más
            );
            loyaltyRepository.saveAll(discounts);
            System.out.println("✅ Descuentos por frecuencia precargados.");
        }
    }

    private void reservationHourLoad(){
        if (reservationHourRepository.count() == 0) {
            ReservationHourEntity config = new ReservationHourEntity(
                    null,
                    LocalTime.of(14, 0),  // weeklyHourMin
                    LocalTime.of(22, 0),  // weeklyHourMax
                    LocalTime.of(10, 0),  // specialHourMin
                    LocalTime.of(22, 0)   // specialHourMax
            );

            reservationHourRepository.save(config);
            System.out.println("✅ Configuración horaria precargada.");
        }
    }

    private void peopleLoad(){
        if (peopleRepository.count() == 0) {
            List<PeopleDiscountEntity> discounts = List.of(
                    new PeopleDiscountEntity(null, 1, 2, 0.0),
                    new PeopleDiscountEntity(null, 3, 5, 0.10),
                    new PeopleDiscountEntity(null, 6, 10, 0.20),
                    new PeopleDiscountEntity(null, 11,15,0.30)
            );
            peopleRepository.saveAll(discounts);
            System.out.println("✅ Descuentos por cantidad de personas precargados.");
        }
    }

    private void birthdayLoad(){
        if (birthdayRepository.count() == 0) {
            List<BirthdayEntity> cumples = List.of(
                    new BirthdayEntity(null, 1, 2,"Sin descuento de cumpleaños", 0.0),
                    new BirthdayEntity(null, 3, 5, "Descuento de cumpleaños", 0.5),
                    new BirthdayEntity(null, 6, 10, "Descuento de cumplaños", 0.5)
            );
            birthdayRepository.saveAll(cumples);
            System.out.println("✅ Descuentos de cumpleaños precargados en la base de datos.");
        }
    }

    private void holidayLoad(){
        if (holidayRepository.count() == 0) {
            List<HolidayEntity> feriados = List.of(
                    new HolidayEntity(null, LocalDate.of(1, 1, 1), "Descuento Fines de Semana", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 1, 1), "Año Nuevo", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 4, 18), "Viernes Santo", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 4, 19), "Sábado Santo", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 5, 1), "Día del Trabajo", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 5, 21), "Glorias Navales", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 6, 20), "Día Nacional de los Pueblos Indígenas", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 6, 29), "San Pedro y San Pablo", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 7, 16), "Virgen del Carmen", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 8, 15), "Asunción de la Virgen", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 8, 20), "Nacimiento del Prócer de la Independencia", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 9, 18), "Independencia Nacional", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 9, 19), "Glorias del Ejército", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 10, 12), "Encuentro de Dos Mundos", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 10, 31), "Iglesias Evangélicas y Protestantes", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 11, 1), "Todos los Santos", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 11, 16), "Elecciones Presidenciales y Parlamentarias", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 12, 8), "Inmaculada Concepción", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 12, 14), "Elección Presidencial (Segunda Vuelta)", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 12, 25), "Navidad", 0.21),
                    new HolidayEntity(null, LocalDate.of(2025, 12, 31), "Feriado Bancario", 0.21)
            );
            holidayRepository.saveAll(feriados);
            System.out.println("✅ Feriados precargados en la base de datos.");
        }
    }
}
