WITH capteurs_intervention AS (
  SELECT
    _intervention.deveui,
    max(
      CASE
        WHEN (
          (_intervention.typeintervention) :: text = ANY (
            ARRAY [('Installation'::character varying)::text, ('Remplacement'::character varying)::text, ('MaJ site'::character varying)::text]
          )
        ) THEN _intervention.dateintervention
        ELSE NULL :: timestamp without time zone
      END
    ) AS last_install,
    max(
      CASE
        WHEN (
          (_intervention.typeintervention) :: text = 'Retrait' :: text
        ) THEN _intervention.dateintervention
        ELSE NULL :: timestamp without time zone
      END
    ) AS last_retrait
  FROM
    _intervention
  GROUP BY
    _intervention.deveui
),
capteurs_installables AS (
  SELECT
    c_1.deveui
  FROM
    (
      _capteur c_1
      LEFT JOIN capteurs_intervention i ON (((c_1.deveui) :: text = (i.deveui) :: text))
    )
  WHERE
    (
      (i.deveui IS NULL)
      OR (i.last_install IS NULL)
      OR (
        (i.last_retrait IS NOT NULL)
        AND (i.last_retrait >= i.last_install)
      )
    )
)
SELECT
  m.nommarque,
  c.referenceinterne,
  mo.nommodele,
  mo.nomchirpstack,
  c.deveui,
  CASE
    WHEN (ci.deveui IS NOT NULL) THEN 'oui' :: text
    ELSE 'non' :: text
  END AS en_stock,
  c.esthorsservice
FROM
  (
    (
      (
        _capteur c
        JOIN _modele mo ON (
          (
            (c.referenceinterne) :: text = (mo.referenceinterne) :: text
          )
        )
      )
      JOIN _marque m ON (((mo.nommarque) :: text = (m.nommarque) :: text))
    )
    LEFT JOIN capteurs_installables ci ON (((c.deveui) :: text = (ci.deveui) :: text))
  );