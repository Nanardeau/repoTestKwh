WITH installations_en_cours AS (
  SELECT
    DISTINCT i.idintervention,
    ma.nommarque,
    m.nommodele,
    m.referencefournisseur,
    i.deveui,
    i.idpiece,
    i.idcompteur,
    COALESCE(s1.idsite, s2.idsite) AS idsite,
    COALESCE(s1.nomsite, s2.nomsite) AS nom_site,
    c.esthorsservice AS hs,
    COALESCE(l1.identitelocale, l2.identitelocale) AS idlocale,
    COALESCE(c1.identite, c2.identite) AS id,
    COALESCE(c1.denomination, c2.denomination) AS denomination,
    COALESCE(c1.nomvoie, c2.nomvoie) AS nomvoie,
    COALESCE(c1.codepostal, c2.codepostal) AS code_postal,
    COALESCE(co.nomcommune, co2.nomcommune) AS ville,
    c.datearrivee
  FROM
    (
      (
        (
          (
            (
              (
                (
                  (
                    (
                      (
                        (
                          (
                            (
                              (
                                (
                                  (
                                    _intervention i
                                    LEFT JOIN _capteur c ON (((i.deveui) :: text = (c.deveui) :: text))
                                  )
                                  LEFT JOIN _modele m ON (
                                    (
                                      (c.referenceinterne) :: text = (m.referenceinterne) :: text
                                    )
                                  )
                                )
                                LEFT JOIN _marque ma ON (((m.nommarque) :: text = (ma.nommarque) :: text))
                              )
                              LEFT JOIN _piece p ON (((i.idpiece) :: text = (p.idpiece) :: text))
                            )
                            LEFT JOIN _batiment b ON (((p.idbat) :: text = (b.idbat) :: text))
                          )
                          LEFT JOIN _site s1 ON (((b.idsite) :: text = (s1.idsite) :: text))
                        )
                        LEFT JOIN (
                          SELECT
                            DISTINCT ON (l1_1.idbat) l1_1.numlot,
                            l1_1.idbat,
                            l1_1.typeexploitation,
                            l1_1.identitelocaleproprio,
                            l1_1.identitelocale,
                            l1_1.qualiteassujettie,
                            l1_1.typelot
                          FROM
                            _lot l1_1
                          ORDER BY
                            l1_1.idbat,
                            l1_1.numlot DESC
                        ) l1 ON (((b.idbat) :: text = (l1.idbat) :: text))
                      )
                      LEFT JOIN _client c1 ON ((l1.identitelocale = c1.identitelocale))
                    )
                    LEFT JOIN _commune co ON (
                      (
                        ((c1.codecommune) :: text = (co.codecommune) :: text)
                        AND (c1.codepostal = co.codepostal)
                      )
                    )
                  )
                  LEFT JOIN _alimente a ON (((i.idcompteur) :: text = (a.idcompteur) :: text))
                )
                LEFT JOIN _piece p2 ON (((a.idpiece) :: text = (p2.idpiece) :: text))
              )
              LEFT JOIN _batiment b2 ON (((p2.idbat) :: text = (b2.idbat) :: text))
            )
            LEFT JOIN _site s2 ON (((b2.idsite) :: text = (s2.idsite) :: text))
          )
          LEFT JOIN (
            SELECT
              DISTINCT ON (l2_1.idbat) l2_1.numlot,
              l2_1.idbat,
              l2_1.typeexploitation,
              l2_1.identitelocaleproprio,
              l2_1.identitelocale,
              l2_1.qualiteassujettie,
              l2_1.typelot
            FROM
              _lot l2_1
            ORDER BY
              l2_1.idbat,
              l2_1.numlot DESC
          ) l2 ON (((b2.idbat) :: text = (l2.idbat) :: text))
        )
        LEFT JOIN _client c2 ON ((l2.identitelocale = c2.identitelocale))
      )
      LEFT JOIN _commune co2 ON (
        (
          ((c2.codecommune) :: text = (co2.codecommune) :: text)
          AND (c2.codepostal = co2.codepostal)
        )
      )
    )
  WHERE
    (
      (
        (i.typeintervention) :: text = ANY (
          ARRAY [('Installation'::character varying)::text, ('Remplacement'::character varying)::text, ('MaJ site'::character varying)::text]
        )
      )
      AND (i.dateintervention <= CURRENT_TIMESTAMP)
      AND (
        NOT (
          EXISTS (
            SELECT
              1
            FROM
              _intervention i2
            WHERE
              (
                ((i2.deveui) :: text = (i.deveui) :: text)
                AND ((i2.typeintervention) :: text = 'Retrait' :: text)
                AND (i2.dateintervention > i.dateintervention)
              )
          )
        )
      )
    )
),
toutes_installations AS (
  SELECT
    DISTINCT i.idintervention,
    ma.nommarque,
    m.nommodele,
    m.referencefournisseur,
    i.deveui,
    i.idpiece,
    i.idcompteur,
    COALESCE(s1.idsite, s2.idsite) AS idsite,
    COALESCE(s1.nomsite, s2.nomsite) AS nom_site,
    c.esthorsservice AS hs,
    COALESCE(l1.identitelocale, l2.identitelocale) AS idlocale,
    COALESCE(c1.identite, c2.identite) AS id,
    COALESCE(c1.denomination, c2.denomination) AS denomination,
    COALESCE(c1.nomvoie, c2.nomvoie) AS nomvoie,
    COALESCE(c1.codepostal, c2.codepostal) AS code_postal,
    COALESCE(co.nomcommune, co2.nomcommune) AS ville,
    c.datearrivee
  FROM
    (
      (
        (
          (
            (
              (
                (
                  (
                    (
                      (
                        (
                          (
                            (
                              (
                                (
                                  (
                                    _intervention i
                                    LEFT JOIN _capteur c ON (((i.deveui) :: text = (c.deveui) :: text))
                                  )
                                  LEFT JOIN _modele m ON (
                                    (
                                      (c.referenceinterne) :: text = (m.referenceinterne) :: text
                                    )
                                  )
                                )
                                LEFT JOIN _marque ma ON (((m.nommarque) :: text = (ma.nommarque) :: text))
                              )
                              LEFT JOIN _piece p ON (((i.idpiece) :: text = (p.idpiece) :: text))
                            )
                            LEFT JOIN _batiment b ON (((p.idbat) :: text = (b.idbat) :: text))
                          )
                          LEFT JOIN _site s1 ON (((b.idsite) :: text = (s1.idsite) :: text))
                        )
                        LEFT JOIN (
                          SELECT
                            DISTINCT ON (l1_1.idbat) l1_1.numlot,
                            l1_1.idbat,
                            l1_1.typeexploitation,
                            l1_1.identitelocaleproprio,
                            l1_1.identitelocale,
                            l1_1.qualiteassujettie,
                            l1_1.typelot
                          FROM
                            _lot l1_1
                          ORDER BY
                            l1_1.idbat,
                            l1_1.numlot DESC
                        ) l1 ON (((b.idbat) :: text = (l1.idbat) :: text))
                      )
                      LEFT JOIN _client c1 ON ((l1.identitelocale = c1.identitelocale))
                    )
                    LEFT JOIN _commune co ON (
                      (
                        ((c1.codecommune) :: text = (co.codecommune) :: text)
                        AND (c1.codepostal = co.codepostal)
                      )
                    )
                  )
                  LEFT JOIN _alimente a ON (((i.idcompteur) :: text = (a.idcompteur) :: text))
                )
                LEFT JOIN _piece p2 ON (((a.idpiece) :: text = (p2.idpiece) :: text))
              )
              LEFT JOIN _batiment b2 ON (((p2.idbat) :: text = (b2.idbat) :: text))
            )
            LEFT JOIN _site s2 ON (((b2.idsite) :: text = (s2.idsite) :: text))
          )
          LEFT JOIN (
            SELECT
              DISTINCT ON (l2_1.idbat) l2_1.numlot,
              l2_1.idbat,
              l2_1.typeexploitation,
              l2_1.identitelocaleproprio,
              l2_1.identitelocale,
              l2_1.qualiteassujettie,
              l2_1.typelot
            FROM
              _lot l2_1
            ORDER BY
              l2_1.idbat,
              l2_1.numlot DESC
          ) l2 ON (((b2.idbat) :: text = (l2.idbat) :: text))
        )
        LEFT JOIN _client c2 ON ((l2.identitelocale = c2.identitelocale))
      )
      LEFT JOIN _commune co2 ON (
        (
          ((c2.codecommune) :: text = (co2.codecommune) :: text)
          AND (c2.codepostal = co2.codepostal)
        )
      )
    )
),
installations_passees AS (
  SELECT
    toutes_installations.idintervention,
    toutes_installations.nommarque,
    toutes_installations.nommodele,
    toutes_installations.referencefournisseur,
    toutes_installations.deveui,
    toutes_installations.idpiece,
    toutes_installations.idcompteur,
    toutes_installations.idsite,
    toutes_installations.nom_site,
    toutes_installations.hs,
    toutes_installations.idlocale,
    toutes_installations.id,
    toutes_installations.denomination,
    toutes_installations.nomvoie,
    toutes_installations.code_postal,
    toutes_installations.ville,
    toutes_installations.datearrivee
  FROM
    toutes_installations
  EXCEPT
  SELECT
    installations_en_cours.idintervention,
    installations_en_cours.nommarque,
    installations_en_cours.nommodele,
    installations_en_cours.referencefournisseur,
    installations_en_cours.deveui,
    installations_en_cours.idpiece,
    installations_en_cours.idcompteur,
    installations_en_cours.idsite,
    installations_en_cours.nom_site,
    installations_en_cours.hs,
    installations_en_cours.idlocale,
    installations_en_cours.id,
    installations_en_cours.denomination,
    installations_en_cours.nomvoie,
    installations_en_cours.code_postal,
    installations_en_cours.ville,
    installations_en_cours.datearrivee
  FROM
    installations_en_cours
),
capteurs_jamais_installes AS (
  SELECT
    NULL :: integer AS idintervention,
    ma.nommarque,
    m.nommodele,
    m.referencefournisseur,
    c.deveui,
    NULL :: character varying AS idpiece,
    NULL :: character varying AS idcompteur,
    NULL :: character varying AS idsite,
    NULL :: character varying AS nom_site,
    c.esthorsservice AS hs,
    NULL :: character(1) AS idlocale,
    NULL :: character varying AS id,
    NULL :: character varying AS denomination,
    NULL :: character varying AS nomvoie,
    NULL :: character varying AS code_postal,
    NULL :: character varying AS ville,
    c.datearrivee
  FROM
    (
      (
        _capteur c
        LEFT JOIN _modele m ON (
          (
            (c.referenceinterne) :: text = (m.referenceinterne) :: text
          )
        )
      )
      LEFT JOIN _marque ma ON (((m.nommarque) :: text = (ma.nommarque) :: text))
    )
  WHERE
    (
      NOT (
        (c.deveui) :: text IN (
          SELECT
            DISTINCT _intervention.deveui
          FROM
            _intervention
        )
      )
    )
)
SELECT
  DISTINCT ON (installations_en_cours.deveui) installations_en_cours.idintervention,
  installations_en_cours.nommarque,
  installations_en_cours.nommodele,
  installations_en_cours.referencefournisseur,
  installations_en_cours.deveui,
  installations_en_cours.idpiece,
  installations_en_cours.idcompteur,
  installations_en_cours.idsite,
  installations_en_cours.nom_site,
  installations_en_cours.hs,
  installations_en_cours.idlocale,
  installations_en_cours.id,
  installations_en_cours.denomination,
  installations_en_cours.nomvoie,
  installations_en_cours.code_postal,
  installations_en_cours.ville,
  installations_en_cours.datearrivee,
  'on air' :: text AS statut
FROM
  installations_en_cours
UNION
ALL
SELECT
  DISTINCT ON (installations_passees.deveui) installations_passees.idintervention,
  installations_passees.nommarque,
  installations_passees.nommodele,
  installations_passees.referencefournisseur,
  installations_passees.deveui,
  installations_passees.idpiece,
  installations_passees.idcompteur,
  installations_passees.idsite,
  installations_passees.nom_site,
  installations_passees.hs,
  installations_passees.idlocale,
  installations_passees.id,
  installations_passees.denomination,
  installations_passees.nomvoie,
  installations_passees.code_postal,
  installations_passees.ville,
  installations_passees.datearrivee,
  'stock' :: text AS statut
FROM
  installations_passees
WHERE
  (
    NOT (
      (installations_passees.deveui) :: text IN (
        SELECT
          installations_en_cours.deveui
        FROM
          installations_en_cours
      )
    )
  )
UNION
ALL
SELECT
  capteurs_jamais_installes.idintervention,
  capteurs_jamais_installes.nommarque,
  capteurs_jamais_installes.nommodele,
  capteurs_jamais_installes.referencefournisseur,
  capteurs_jamais_installes.deveui,
  capteurs_jamais_installes.idpiece,
  capteurs_jamais_installes.idcompteur,
  capteurs_jamais_installes.idsite,
  capteurs_jamais_installes.nom_site,
  capteurs_jamais_installes.hs,
  capteurs_jamais_installes.idlocale,
  capteurs_jamais_installes.id,
  capteurs_jamais_installes.denomination,
  capteurs_jamais_installes.nomvoie,
  capteurs_jamais_installes.code_postal,
  capteurs_jamais_installes.ville,
  capteurs_jamais_installes.datearrivee,
  'stock' :: text AS statut
FROM
  capteurs_jamais_installes
ORDER BY
  18,
  5;