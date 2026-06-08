SELECT
  s.idsite,
  s.nomsite,
  b.idbat,
  b.nombat,
  h.idcompteur,
  c.intitule,
  h.datedebut,
  h.datefin,
  h.coefmulti,
  c.usage,
  c.estsouscompteur,
  c.idressource,
  r.nomressource,
  c.puissancesouscrite,
  c.iddistributeur,
  d.nomdistributeur,
  c.nomvoie
FROM
  (
    (
      (
        (
          (
            (
              (
                _historiquecompteur h
                JOIN _compteur c ON (((h.idcompteur) :: text = (c.idcompteur) :: text))
              )
              LEFT JOIN _ressourcemesure r ON ((c.idressource = r.idressource))
            )
            LEFT JOIN _distributeur d ON ((c.iddistributeur = d.iddistributeur))
          )
          JOIN (
            SELECT
              c_1.idcompteur,
              max((a.idpiece) :: text) AS lapiece
            FROM
              (
                _compteur c_1
                JOIN _alimente a ON (((a.idcompteur) :: text = (c_1.idcompteur) :: text))
              )
            GROUP BY
              c_1.idcompteur
          ) r1 ON (((r1.idcompteur) :: text = (c.idcompteur) :: text))
        )
        JOIN _piece p ON (((p.idpiece) :: text = r1.lapiece))
      )
      JOIN _batiment b ON (((b.idbat) :: text = (p.idbat) :: text))
    )
    JOIN _site s ON (((s.idsite) :: text = (b.idsite) :: text))
  )
ORDER BY
  h.idcompteur;