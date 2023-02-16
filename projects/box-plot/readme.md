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

select distinct c.name, name_rus, p.type, total_component_score
from tech t
join programs p on p.id=t.program_id
join skaters s on s.id=p.skater_id
join competitions c on p.comp_id=c.id
join components comp on comp.program_id=p.id
where discipline='w'
and name_rus=ANY('{Камила ВАЛИЕВА, Елизавета ТУКТАМЫШЕВА, Софья САМОДЕЛКИНА, Софья МУРАВЬЕВА, Александра ТРУСОВА, Софья АКАТЬЕВА}')

select c.name, name_rus, p.type, element_number, element_name, info, base_value, multiplayer, grade_of_execution, scores_of_panel
from tech t
join programs p on p.id=t.program_id
join skaters s on s.id=p.skater_id
join competitions c on p.comp_id=c.id
where discipline='w'
and name_rus=ANY('{Камила ВАЛИЕВА, Елизавета ТУКТАМЫШЕВА, Софья САМОДЕЛКИНА, Софья МУРАВЬЕВА, Александра ТРУСОВА, Софья АКАТЬЕВА}')
and name='Чемпионат России'
and element_name not like 'FCS%'
and element_name not like '%Sp%'
and element_name not like '%Sq%'
-- psql -c "\copy (select 'tønder') to 'C:\temp\Sønderborg.csv' (FORMAT CSV, HEADER TRUE, DELIMITER ';', ENCODING 'UTF8')"
