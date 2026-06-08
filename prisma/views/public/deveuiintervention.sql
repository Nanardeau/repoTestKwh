WITH last_intervention AS (
  SELECT
    DISTINCT ON (i_1.deveui) i_1.deveui,
    i_1.description,
    i_1.dateintervention,
    i_1.typeintervention,
    i_1.idcompteur,
    i_1.idpiece,
    i_1.etalonnage,
    i_1.estactive,
    i_1.asset,
    i_1.idintervention,
    i_1.idbat,
    i_1.deveuip
  FROM
    _intervention i_1
  ORDER BY
    i_1.deveui,
    i_1.dateintervention DESC
)
SELECT
  i.deveui,
  i.dateintervention,
  i.typeintervention,
  CASE
    WHEN (i.idcompteur IS NOT NULL) THEN 'Compteur' :: text
    WHEN (i.idpiece IS NOT NULL) THEN 'Piece' :: text
    WHEN (i.deveuip IS NOT NULL) THEN 'Passerelle' :: text
    ELSE NULL :: text
  END AS "table",
  CASE
    WHEN (i.idcompteur IS NOT NULL) THEN i.idcompteur
    WHEN (i.idpiece IS NOT NULL) THEN i.idpiece
    WHEN (i.deveuip IS NOT NULL) THEN i.deveuip
    ELSE NULL :: character varying
  END AS id,
  mo.nommodele,
  r.idressource,
  r.nomressource,
  r.unite,
  i.etalonnage,
  CASE
    WHEN (i.idcompteur IS NOT NULL) THEN co.asset
    WHEN (i.idpiece IS NOT NULL) THEN i.asset
    ELSE NULL :: json
  END AS asset
FROM
  (
    (
      (
        (
          (
            last_intervention i
            LEFT JOIN _compteur co ON (((i.idcompteur) :: text = (co.idcompteur) :: text))
          )
          LEFT JOIN _capteur ca ON (((i.deveui) :: text = (ca.deveui) :: text))
        )
        LEFT JOIN _modele mo ON (
          (
            (ca.referenceinterne) :: text = (mo.referenceinterne) :: text
          )
        )
      )
      LEFT JOIN _releve re ON (
        (
          (mo.referenceinterne) :: text = (re.referenceinterne) :: text
        )
      )
    )
    LEFT JOIN _ressourcemesure r ON ((re.idressource = r.idressource))
  )
WHERE
  ((i.typeintervention) :: text <> 'Retrait' :: text);