WITH conso_cref AS (
  SELECT
    distinct_data.idbat,
    distinct_data.nombat,
    distinct_data.anneecref,
    sum(distinct_data.totalanneeconso) AS total_consommation_batiment
  FROM
    (
      SELECT
        DISTINCT b_1.idbat,
        b_1.nombat,
        c_1.idcompteur,
        b_1.anneecref,
        conso.totalanneeconso
      FROM
        (
          (
            (
              (
                _piece p_1
                LEFT JOIN _alimente a ON (((p_1.idpiece) :: text = (a.idpiece) :: text))
              )
              LEFT JOIN _compteur c_1 ON (((a.idcompteur) :: text = (c_1.idcompteur) :: text))
            )
            JOIN _batiment b_1 ON (((p_1.idbat) :: text = (b_1.idbat) :: text))
          )
          LEFT JOIN _consommation conso ON (
            (
              (
                (c_1.idcompteur) :: text = (conso.idcompteur) :: text
              )
              AND (b_1.anneecref = conso.annee)
            )
          )
        )
    ) distinct_data
  GROUP BY
    distinct_data.idbat,
    distinct_data.nombat,
    distinct_data.anneecref
)
SELECT
  b.idbat,
  b.nombat,
  b.nomvoie,
  s.codepostal,
  c.nomcommune,
  b.cmpltadresse,
  b.longitude,
  b.latitude,
  s.idsite,
  s.nomsite,
  b.anneecref,
  conso_cref.total_consommation_batiment,
  b.idsmplr,
  b.datecreauib,
  b.mixte,
  CASE
    WHEN (sum(p.surface) IS NULL) THEN 'sans surface' :: character varying
    ELSE (round((sum(p.surface)) :: numeric, 2)) :: character varying
  END AS surface_totale
FROM
  (
    (
      (
        (
          (
            _batiment b
            JOIN _site s ON (((b.idsite) :: text = (s.idsite) :: text))
          )
          LEFT JOIN _commune c ON (
            (
              ((s.codecommune) :: text = (c.codecommune) :: text)
              AND (s.codepostal = c.codepostal)
            )
          )
        )
        LEFT JOIN _lot l ON (((b.idbat) :: text = (l.idbat) :: text))
      )
      LEFT JOIN _piece p ON (
        (
          ((l.numlot) :: text = (p.numlot) :: text)
          AND ((l.idbat) :: text = (p.idbat) :: text)
        )
      )
    )
    LEFT JOIN conso_cref ON (((b.idbat) :: text = (conso_cref.idbat) :: text))
  )
GROUP BY
  b.idbat,
  b.nombat,
  b.nomvoie,
  s.codepostal,
  c.nomcommune,
  b.cmpltadresse,
  b.longitude,
  b.latitude,
  s.idsite,
  s.nomsite,
  b.anneecref,
  conso_cref.total_consommation_batiment,
  b.idsmplr,
  b.datecreauib,
  b.mixte
ORDER BY
  b.idbat;