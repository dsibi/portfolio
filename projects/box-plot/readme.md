select name, name_eng, name_rus, element_name, base_value, scores_of_panel
from tech t
join programs p on p.id=t.program_id
join skaters s on s.id=p.skater_id
join competitions c on c.id=p.comp_id
where discipline='w'
and (element_name like '3A%'
or element_name like '4%')

1.	Кто исполняет элементы ультра-си?
2.	Сколько элементов ультра-си было исполнено?
3.	У кого самая высока оценка (медиана/среднее)?
4.	Самый стабильный и не стабильный спортсмен?
