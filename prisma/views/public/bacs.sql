WITH pieces_uniques AS (
  SELECT
    DISTINCT p.idpiece,
    p.surface,
    l.idbat,
    c.idcompteur,
    c.puissancesouscrite
  FROM
    (
      (
        (
          _compteur c
          LEFT JOIN _alimente a ON (((c.idcompteur) :: text = (a.idcompteur) :: text))
        )
        LEFT JOIN _piece p ON (((a.idpiece) :: text = (p.idpiece) :: text))
      )
      LEFT JOIN _lot l ON (
        (
          ((p.numlot) :: text = (l.numlot) :: text)
          AND ((p.idbat) :: text = (l.idbat) :: text)
        )
      )
    )
  WHERE
    (c.estprive IS FALSE)
),
compteurs_puissance AS (
  SELECT
    pieces_uniques.idbat,
    pieces_uniques.idcompteur,
    sum(pieces_uniques.puissancesouscrite) AS puissance_totale
  FROM
    pieces_uniques
  WHERE
    (pieces_uniques.puissancesouscrite IS NOT NULL)
  GROUP BY
    pieces_uniques.idbat,
    pieces_uniques.idcompteur
  HAVING
    (sum(pieces_uniques.puissancesouscrite) > 70)
)
SELECT
  b.idbat,
  b.nombat,
  CASE
    WHEN (sum(pu.surface) IS NULL) THEN 'sans surface' :: character varying
    ELSE (round((sum(pu.surface)) :: numeric, 2)) :: character varying
  END AS surface_totale,
  cp.puissance_totale,
  CASE
    WHEN (
      (cp.puissance_totale >= 70)
      AND (cp.puissance_totale <= 290)
    ) THEN 2027
    WHEN (cp.puissance_totale > 292) THEN 2025
    ELSE NULL :: integer
  END AS bacs
FROM
  (
    (
      pieces_uniques pu
      JOIN _batiment b ON (((pu.idbat) :: text = (b.idbat) :: text))
    )
    JOIN compteurs_puissance cp ON (
      (
        ((pu.idbat) :: text = (cp.idbat) :: text)
        AND ((pu.idcompteur) :: text = (cp.idcompteur) :: text)
      )
    )
  )
GROUP BY
  b.idbat,
  b.nombat,
  cp.puissance_totale;