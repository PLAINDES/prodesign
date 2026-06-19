
function createData(
    categoria,
    muros_y_columnas,
    techos,
    pisos,
    puertas_y_ventanas,
    revestimientos,
    banos,
    instalaciones,
    desc
) {
    return {
        categoria,
        muros_y_columnas,
        techos,
        pisos,
        puertas_y_ventanas,
        revestimientos,
        banos,
        instalaciones,
    };
}

const row_lima_callao = [
    createData("A", "Estructuras laminares curvadas de concreto armado que incluyen en una sola armadura la cimentación y el techo.", "Losa o aligerado de concreto armado con luces mayores de 6 m y sobrecarga mayor a 300 kg/m².", "Mármol importado, piedras naturales importadas, porcelanato.", "Aluminio pesado con perfiles especiales, madera fina ornamental, vidrio insulado.", "Mármol importado, madera fina, baldosa acústica en techo o similar.", "Baños completos de lujo importado con enchape fino.", "Aire acondicionado, iluminación especial, ventilación forzada, sistema hidroneumático, agua caliente y fría, intercomunicador, alarmas, ascensor, sistema de bombeo, teléfono, gas natural."),
    createData("B", "Columnas, vigas y/o placas de concreto armado y/o metálicas.", "Aligerados o losas de concreto armado inclinadas.", "Mármol nacional o reconstituido, parquet fino, cerámica importada, madera fina.", "Aluminio o madera fina de diseño especial, vidrio polarizado, curvado, laminado o templado.", "Mármol nacional, madera fina, enchapes en techos.", "Baños completos importados con mayólica o cerámico decorativo importado.", "Sistema de bombeo de agua potable, ascensor, teléfono, agua caliente y fría, gas natural."),
    createData("C", "Placas de concreto (10 a 15 cm), albañilería armada con columnas y vigas de amarre.", "Aligerado o losas de concreto armado horizontales.", "Madera fina machihembrada, terrazo.", "Aluminio o madera fina, vidrio polarizado, laminado o templado.", "Superficie caravista obtenida mediante encofrado especial, enchape en techos.", "Baños completos nacionales con mayólica o cerámico nacional de color.", "Igual a la categoría B sin ascensor."),
    createData("D", "Ladrillo o similar sin elementos de concreto armado, drywall o similar incluye techo.", "Calamina metálica, fibrocemento sobre viguería metálica, bambú.", "Parquet de primera, lajas, cerámica nacional, loseta veneciana 40x40, piso laminado.", "Ventanas de aluminio, puertas de madera selecta, vidrio tratado transparente.", "Enchape de madera o laminados, piedra o material vitrificado.", "Baños completos nacionales blancos con mayólica blanca.", "Agua fría, agua caliente, corriente trifásica, teléfono, gas natural."),
    createData("E", "Adobe, tapial o quincha, bambú estructural.", "Madera con material impermeabilizante, policarbonato.", "Parquet de segunda, loseta veneciana 30x30, lajas de cemento con canto rodado.", "Ventanas de fierro, puertas de madera selecta, vidrio simple transparente.", "Superficie de ladrillo caravista.", "Baños con mayólica blanca, parcial.", "Agua fría, agua caliente, corriente monofásica, teléfono, gas natural."),
    createData("F", "Madera, drywall o similar (sin techo).", "Calamina metálica, fibrocemento o teja sobre viguería de madera corriente.", "Loseta corriente, canto rodado, alfombra.", "Ventanas de fierro o aluminio industrial, puertas contraplacadas de madera, MDF o HDF.", "Tarrajeo frotachado y/o yeso moldurado, pintura lavable.", "Baños blancos sin mayólica.", "Agua fría, corriente monofásica, teléfono, gas natural."),
    createData("G", "Pircado con mezcla de barro.", "Madera rústica o caña con torta de barro.", "Loseta vinílica, cemento bruñido coloreado, tapizón.", "Madera corriente con marcos en puertas y ventanas de PVC o madera corriente.", "Estucado de yeso y/o barro, pintura al temple o al agua.", "Sanitarios básicos de losa de segunda, fierro fundido o granito.", "Agua fría, corriente monofásica sin empotrar."),
    createData("H", "", "Sin techo.", "Cemento pulido, ladrillo corriente, entablado corriente.", "Madera rústica.", "Pintado en ladrillo rústico, placa de concreto o similar.", "Sin aparatos sanitarios.", "Agua fría, corriente monofásica sin empotrar."),
    createData("I", "", "", "Tierra compactada.", "Sin puertas ni ventanas.", "Sin revestimientos en ladrillo, adobe o similar.", "", "Sin instalación eléctrica ni sanitaria.")
];

const rows_excep_lima_callao = [
    createData(
        "A",
        "Estructuras laminares curvadas de concreto armado que incluyen en una sola armadura la cimentación y el techo. Para este caso no se considera los valores de la columna Nº2.",
        "Losa o aligerado de concreto armado con luces libres mayores a 6 m. medida entre cara de los apoyos y sobrecarga mayor a 300 kg/m2 (8).",
        "Mármol importado, piedras naturales importadas, porcelanato.",
        "Aluminio pesado con perfiles especiales, madera fina ornamental (caoba, cedro o pino selecto), vidrio insulado (1).",
        "Mármol importado, madera fina (caoba o similar) baldosa acústica en techo o similar.",
        "Baños completos (7) de lujo importado con enchape fino (mármol o similar).",
        "Aire acondicionado, iluminación especial, ventilación forzada, sist. hidroneumático, agua caliente y fría, intercomunicador, alarmas, ascensor, sistema bombeo de agua y desague (5), teléfono."
    ),
    createData(
        "B",
        "Columnas, vigas y/o placas de concreto armado y/o metálicas.",
        "Aligerados o losas de concreto armado inclinadas.",
        "Mármol nacional o reconstituido, parquet fino (olivo, chonta o similar), cerámica importada, madera fina.",
        "Aluminio o madera fina (caoba o similar) de diseño especial, vidrio tratado polarizado (2) y curvado, laminado o templado.",
        "Mármol nacional, madera fina (caoba o similar) enchapes en techos.",
        "Baños completos (7) importados con mayólica o cerámico decorativo importado.",
        "Sistema de bombeo de agua potable (5), ascensor, teléfono, agua caliente y fría."
    ),
    createData(
        "C",
        "Placas de concreto (e=10 a 15 cm), albañilería armada ladrillo o similar con columnas y vigas de amarre de concreto armado.",
        "Aligerado o losas de concreto armado horizontales.",
        "Madera fina machihembrada, terrazo.",
        "Aluminio o madera fina (caoba o similar), vidrio tratado polarizado (2), laminado o templado.",
        "Superficie caravista obtenida mediante encofrado especial, enchape en techos.",
        "Baños completos (7) nacionales con mayólica o cerámico nacional de color.",
        "Igual al punto 'B' sin ascensor."
    ),
    createData(
        "D",
        "Ladrillo o similar sin elementos de concreto armado, drywall o similar incluye techo (6).",
        "Calamina metálica, fibrocemento sobre viguería metálica, bambú.",
        "Parquet de 1era, lajas, cerámica nacional, loseta veneciana 40x40, piso laminado.",
        "Ventanas de aluminio, puertas de madera selecta, vidrio tratado transparente (3).",
        "Enchape de madera o laminados, piedra o material vitrificado.",
        "Baños completos (7) nacionales blancos con mayólica blanca.",
        "Agua fría, agua caliente, corriente trifásica, teléfono."
    ),
    createData(
        "E",
        "Adobe, tapial o quincha, bambú estructural.",
        "Madera con material impermeabilizante, policarbonato.",
        "Parquet de 2da, loseta veneciana 30x30, lajas de cemento con canto rodado.",
        "Ventanas de fierro, puertas de madera selecta (caoba o similar), vidrio simple transparente (4).",
        "Superficie de ladrillo caravista.",
        "Baños con mayólica blanca, parcial.",
        "Agua fría, agua caliente, corriente monofásica, teléfono."
    ),
    createData(
        "F",
        "Madera (estoraque, pumaquiro, huayruro, machinga, catahua amarilla, copaiba, diablo fuerte, tornillo o similares), drywall o similar (sin techo).",
        "Calamina metálica, fibrocemento o teja sobre viguería de madera corriente.",
        "Loseta corriente, canto rodado, alfombra.",
        "Ventanas de fierro o aluminio industrial, puertas contraplacadas de madera (cedro o similar), puertas material MDF, HDF, vidrio simple transparente (4).",
        "Tarrajeo frotachado y/o yeso moldurado, pintura lavable.",
        "Baños blancos sin mayólica.",
        "Agua fría, corriente monofásica, teléfono."
    ),
    createData(
        "G",
        "Pircado con mezcla de barro.",
        "Madera rústica o caña con torta de barro.",
        "Loseta vinílica, cemento bruñido coloreado, tapizón.",
        "Madera corriente con marcos en puertas y ventanas de PVC o madera corriente.",
        "Estucado de yeso y/o barro, pintura al temple o al agua.",
        "Sanitarios básicos de losa de 2da, fierro fundido o granito.",
        "Agua fría, corriente monofásica sin empotrar."
    ),
    createData(
        "H",
        "",
        "Sin techo.",
        "Cemento pulido, ladrillo corriente, entablado corriente.",
        "Madera rústica.",
        "Pintado en ladrillo rústico, placa de concreto o similar.",
        "Sin aparatos sanitarios.",
        "Sin instalación eléctrica ni sanitaria."
    ),
    createData(
        "I",
        "",
        "",
        "Tierra compactada.",
        "Sin puertas ni ventanas.",
        "Sin revestimientos en ladrillo, adobe o similar.",
        "",
        ""
    )
];

const rows_selva = [
    createData(
        "A",
        "Estructuras laminares curvadas de concreto armado que incluyen en una sola armadura la cimentación y el techo. Para este caso no se considera los valores de la columna Nº2.",
        "Losa o aligerado de concreto armado con luces libres mayores a 6 m. medida entre cara de los apoyos y sobrecarga mayor a 300 kg/m2 (9).",
        "Mármol importado, piedras naturales importadas, porcelanato.",
        "Aluminio pesado con perfiles especiales, madera fina ornamental (caoba, cedro o pino selecto), vidrio insulado (1).",
        "Mármol importado, madera fina (caoba o similar) baldosa acústica en techo o similar.",
        "Baños completos (8) de lujo importado con enchape fino (mármol o similar).",
        "Aire acondicionado, iluminación especial, ventilación forzada, sist. hidroneumático, agua caliente y fría, intercomunicador, alarmas, ascensor, sistema bombeo de agua y desague (5), teléfono."
    ),
    createData(
        "B",
        "Columnas, vigas y/o placas de concreto armado y/o metálicas.",
        "Aligerados o losas de concreto armado inclinadas.",
        "Mármol nacional o reconstituido, parquet fino (olivo, chonta o similar), cerámica importada, madera fina.",
        "Aluminio o madera fina (caoba o similar) de diseño especial, vidrio tratado polarizado (2) y curvado, laminado o templado.",
        "Mármol nacional, madera fina (caoba o similar) enchapes en techos.",
        "Baños completos (8) importados con mayólica o cerámico decorativo importado.",
        "Sistema de bombeo de agua potable, ascensor, teléfono, agua caliente y fría."
    ),
    createData(
        "C",
        "Placas de concreto (e=10 a 15 cm), albañilería armada, ladrillo o similar con columnas y vigas de amarre de concreto armado.",
        "Aligerado o losas de concreto armado horizontales.",
        "Madera fina machihembrada, terrazo.",
        "Aluminio o madera fina (caoba o similar), vidrio tratado polarizado (2), laminado o templado.",
        "Superficie caravista obtenida mediante encofrado especial, enchape en techos.",
        "Baños completos (8) nacionales con mayólica o cerámico nacional de color.",
        "Igual al punto 'B' sin ascensor."
    ),
    createData(
        "D",
        "Ladrillo o similar, drywall o similar incluye techo (7).",
        "Calamina metálica, fibrocemento sobre viguería metálica.",
        "Parquet de 1era, lajas, cerámica nacional, loseta veneciana 40x40, piso laminado.",
        "Ventanas de aluminio, puertas de madera selecta, vidrio tratado transparente (3).",
        "Enchape de madera o laminados, piedra o material vitrificado.",
        "Baños completos (8) nacionales blancos con mayólica blanca.",
        "Agua fría, agua caliente, corriente trifásica, teléfono."
    ),
    createData(
        "E",
        "Madera selecta tratada (6) sobre pilotaje de madera con base de concreto con muros de madera contraplacada o similar.",
        "Madera selecta tratada (6) con material impermeabilizante, bambú.",
        "Parquet de 2da, loseta veneciana 30x30, lajas de cemento con canto rodado.",
        "Ventanas de fierro, puertas de madera selecta (caoba o similar), vidrio simple transparente (4).",
        "Superficie de ladrillo caravista.",
        "Baños con mayólica blanca, parcial.",
        "Agua fría, agua caliente, corriente monofásica, teléfono."
    ),
    createData(
        "F",
        "Adobe o similar, bambú estructural.",
        "Calamina metálica, fibrocemento o tejas sobre tijerales de madera, policarbonato.",
        "Loseta corriente, canto rodado, alfombra.",
        "Ventanas de fierro o aluminio industrial, puertas contraplacadas de madera (cedro o similar), puertas material MDF, HDF, vidrio simple transparente (4).",
        "Tarrajeo frotachado y/o yeso moldurado, pintura lavable o barnizado sobre madera.",
        "Baños blancos sin mayólica.",
        "Agua fría, corriente monofásica, teléfono."
    ),
    createData(
        "G",
        "Madera tratada (6) selecta con base de concreto con muros de madera tipo contraplacada o similar, drywall o similar (sin techo).",
        "Techos de palmas (crisnejas).",
        "Loseta vinílica, cemento bruñido coloreado, tapizón.",
        "Madera corriente con marcos en puertas y ventanas de PVC o madera corriente.",
        "Estucado de yeso y/o barro, pintura al temple o al agua.",
        "Sanitarios básicos de losa de 2da, fierro fundido o granito.",
        "Agua fría, corriente monofásica sin empotrar."
    ),
    createData(
        "H",
        "Madera corriente.",
        "Sin techo.",
        "Cemento pulido, ladrillo corriente, entablado corriente.",
        "Madera rústica.",
        "Pintado en ladrillo rústico, placa de concreto o similar.",
        "Sin aparatos sanitarios.",
        "Sin instalación eléctrica ni sanitaria."
    ),
    createData(
        "I",
        "Madera rústica.",
        "Tierra compactada.",
        "Sin puertas ni ventanas.",
        "Sin revestimientos en ladrillo, adobe o similar.",
        "",
        "",
        ""
    ),
    createData(
        "J",
        "Caña guayaquil, pona o pintoc.",
        "",
        "",
        "",
        "",
        "",
        ""
    )
];

const rows_sierra = [
    createData(
        "A",
        "Estructuras laminares curvadas de concreto armado que incluyen en una sola armadura la cimentación y el techo. Para este caso no se considera los valores de la columna Nº2.",
        "Losa o aligerado de concreto armado con luces libres mayores a 6 m. medida entre cara de los apoyos y sobrecarga mayor a 300 kg/m2 (8).",
        "Mármol importado, piedras naturales importadas, porcelanato.",
        "Aluminio pesado con perfiles especiales, madera fina ornamental (caoba, cedro o pino selecto), vidrio insulado (1).",
        "Mármol importado, madera fina (caoba o similar) baldosa acústica en techo o similar.",
        "Baños completos (7) de lujo importado con enchape fino (mármol o similar).",
        "Aire acondicionado, iluminación especial, ventilación forzada, sist. hidroneumático, agua caliente y fría, intercomunicador, alarmas, ascensor, sistema bombeo de agua y desague (5), teléfono."
    ),
    createData(
        "B",
        "Columnas, vigas y/o placas de concreto armado y/o metálicas.",
        "Aligerados o losas de concreto armado inclinadas.",
        "Mármol nacional o reconstituido, parquet fino (olivo, chonta o similar), cerámica importada, madera fina.",
        "Aluminio o madera fina (caoba o similar) de diseño especial, vidrio tratado polarizado (2) y curvado, laminado o templado.",
        "Mármol nacional, madera fina (caoba o similar) enchapes en techos.",
        "Baños completos (7) importados con mayólica o cerámico decorativo importado.",
        "Sistema de bombeo de agua potable (5), ascensor, teléfono, agua caliente y fría."
    ),
    createData(
        "C",
        "Placas de concreto (e=10 a 15 cm), albañilería armada ladrillo o similar con columnas y vigas de amarre de concreto armado.",
        "Aligerado o losas de concreto armado horizontales.",
        "Madera fina machihembrada, terrazo.",
        "Aluminio o madera fina (caoba o similar), vidrio tratado polarizado (2), laminado o templado.",
        "Caravista superficie obtenida mediante encofrado especial, enchape en techos.",
        "Baños completos (7) nacionales con mayólica o cerámico nacional de color.",
        "Igual al punto 'B' sin ascensor."
    ),
    createData(
        "D",
        "Ladrillo o similar sin elementos de concreto armado, drywall o similar incluye techo (6).",
        "Calamina metálica, fibrocemento sobre viguería metálica, bambú.",
        "Parquet de 1era, lajas, cerámica nacional, loseta veneciana 40x40, piso laminado.",
        "Ventanas de aluminio, puertas de madera selecta, vidrio tratado transparente (3).",
        "Enchape de madera o laminados, piedra o material vitrificado.",
        "Baños completos (7) nacionales blancos con mayólica blanca.",
        "Agua fría, agua caliente, corriente trifásica, teléfono."
    ),
    createData(
        "E",
        "Adobe, tapial o quincha, bambú estructural.",
        "Madera con material impermeabilizante, policarbonato.",
        "Parquet de 2da, loseta veneciana 30x30, lajas de cemento con canto rodado.",
        "Ventanas de fierro, puertas de madera selecta (caoba o similar), vidrio simple transparente (4).",
        "Superficie de ladrillo caravista.",
        "Baños con mayólica blanca, parcial.",
        "Agua fría, agua caliente, corriente monofásica, teléfono."
    ),
    createData(
        "F",
        "Madera (estoraque, pumaquiro, huayruro, machinga, catahua amarilla, copaiba, diablo fuerte, tornillo o similares), drywall o similar (sin techo).",
        "Calamina metálica, fibrocemento o teja sobre viguería de madera corriente.",
        "Loseta corriente, canto rodado, alfombra.",
        "Ventanas de fierro o aluminio industrial, puertas contraplacadas de madera (cedro o similar), puertas material MDF, HDF, vidrio simple transparente (4).",
        "Tarrajeo frotachado y/o yeso moldurado, pintura lavable.",
        "Baños blancos sin mayólica.",
        "Agua fría, corriente monofásica, teléfono."
    ),
    createData(
        "G",
        "Pircado con mezcla de barro.",
        "Madera rústica o caña con torta de barro.",
        "Loseta vinílica, cemento bruñido coloreado, tapizón.",
        "Madera corriente con marcos en puertas y ventanas de PVC o madera corriente.",
        "Estucado de yeso y/o barro, pintura al temple o al agua.",
        "Sanitarios básicos de losa de 2da, fierro fundido o granito.",
        "Agua fría, corriente monofásica, teléfono."
    ),
    createData(
        "H",
        "",
        "Sin techo.",
        "Cemento pulido, ladrillo corriente, entablado corriente.",
        "Madera rústica.",
        "Pintado en ladrillo rústico, placa de concreto o similar.",
        "Sin aparatos sanitarios.",
        "Agua fría, corriente monofásica sin empotrar."
    ),
    createData(
        "I",
        "",
        "",
        "Tierra compactada.",
        "Sin puertas ni ventanas.",
        "Sin revestimientos en ladrillo, adobe o similar.",
        "",
        "Sin instalación eléctrica ni sanitaria."
    ),
];

const rows = [
	createData(
		"A",
		"Estructuras laminares curvadas de concreto armado que incluyen en una sola armadura la cimentación y el techo. Para este caso no se considera los valores de la columna Nº2.",
		"Losa o aligerado de concreto armado con luces mayores de 6m. Con sobrecarga mayor a 300 kg/m2.",
		"Aluminio pesado con perfiles especiales. Madera fina ornamental (caoba, cedro o pino selecto). Vidrio insulado (1)",
		"Mármol importado, madera fina (caoba o similar), baldosa acústica en techo o similar.",
		"Baños completos (7) de lujo importado con enchape fino (mármol o similar).",
		"Aire acondicionado, ilu- minación especial, ventilación forzada, sist. hidroneumático, agua caliente y fría, intercomunicador alarmas, ascensor, sist. de bombeo de agua y desague (5), teléfono, gas natural."
	),
	createData(
		"B",
		"Columnas, vigas y/o placas de concreto armado y/o metálicas.",
		"Aligerados o losas de concreto armado inclinadas.",
		"Aluminio o madera fina (caoba o similar) de diseño especial, vidrio polarizado (2) y curvado, laminado otemplado.",
		"Mármol nacional, madera fina (caoba o similar) enchapes en techos.",
		"Baños completos (7) importados con mayólica o cerámico decorativo importado.",
		"Sistemas de bombeo de agua potable (5), ascensor, teléfono, agua caliente y fría, gas natural."
	),
	createData(
		"C",
		"Placas de concreto (e=10 a 15 cm), alba- ñilería armada, ladrillo o similar con columna y vigas de amarre de concreto armado.",
		"Aligerado o losas de concreto armado horizontales.",
		"Aluminio o madera fina (caoba o similar), vidrio tratado polarizado (2), laminado o templado.",
		"Superficie caravista obtenida mediante encofrado especial, enchape en techos.",
		"Baños completos (7) nacionales con mayólica o cerámico nacional de color.",
		"Igual al Punto 'B' sin ascensor."
	),
	createData(
		"D",
		"Ladrillo o similar sin elementos de concreto armado. Drywall o similar incluye techo (6)",
		"Calamina metálica, fibrocemento sobre viguería metálica.",
		"Ventanas de aluminio, puertas de madera selecta, vidrio tratado transparente (3).",
		"Enchape de madera o laminados, piedra o material vitrificado.",
		"Baños completos (7) nacionales blancos con mayólica blanca.",
		"Agua fría, agua caliente, corriente trifásica teléfono, gas natural."
	),
	createData(
		"E",
		"Adobe, tapial o quincha.",
		"Madera con material impermeabilizante.",
		"Ventanas de fierro, puertas de madera selecta (caoba o similar), vidrio transparente (4)",
		"Superficie de ladrillo caravista.",
		"Baños con mayólica blanca, parcial.",
		"Agua fría, agua caliente, corriente monofásica, teléfono, gas natural."
	),
	createData(
		"F",
		"Madera (estoraque, pumaquiro, huayruro, machinga, catahua amarilla, copaiba, diablo fuerte, tornillo o similares). Drywall o similar (sin techo)",
		"Calamina metálica, fibrocemento o teja sobre viguería de madera corriente.",
		"Ventanas de fierro o aluminio industrial, puertas contraplacadas de madera (cedro o similar), puertas material MDF o HDF, vidrio simple",
		"Tarrajeo frotachado y/o yeso moldurado, pintura lavable.",
		"Baños blancos sin mayólica.",
		"Agua fría, corriente monofásica, gas natural."
	),
	createData(
		"G",
		"Pircado con mezcla de barro.",
		"Madera rústica o caña con torta de barro.",
		"Madera corriente con marcos en puertas y ventanas de pvc o madera corriente.",
		"Estucado de yeso y/o barro, pintura al temple o al agua.",
		"Sanitarios básicos de losa de  2da., fierro  fundido o granito.",
		"Agua fría, corriente monofásica, teléfono."
	),
	createData(
		"H",
		"",
		"Sin techo.",
		"Madera rústica.",
		"Pintado en ladrillo rústico, placa de concreto o similar.",
		"Sin aparatos sanitarios.",
		"Agua fría, corriente monofásica sin empotrar"
	),
	createData(
		"I",
		"",
		"",
		"Sin puertas ni ventanas.",
		"Sin revestimientos en ladrillo, adobe o similar.",
		"",
		"Sin instalación eléctrica ni sanitaria."
	),
];

export {row_lima_callao, rows_excep_lima_callao, rows_selva, rows_sierra, rows}
