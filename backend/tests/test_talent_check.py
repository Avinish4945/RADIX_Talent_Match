import json, pytest
from app.modules.talent_check.scoring import score_talent_check, TalentCheckValidationError
from app.modules.talent_check.service import load_company_dataset, CompanyDatasetError, run_talent_check, CompanyNotFoundError
REQ=[{"category_code":"COD","required_level":8},{"category_code":"DSA","required_level":6},{"category_code":"SQL","required_level":4}]
def test_full_score():
 r=score_talent_check({"skills":[{"category_code":"COD","level":8},{"category_code":"DSA","level":6},{"category_code":"SQL","level":7}]},"Co",REQ)
 assert r["readiness_score"]==100 and r["coverage_percent"]==100 and all(x["gap"] is False for x in r["skillset_gap"])
def test_better_candidate_scores_higher():
 lo={"skills":[{"category_code":"COD","level":2},{"category_code":"DSA","level":1},{"category_code":"SQL","level":1}]}
 hi={"skills":[{"category_code":"COD","level":6},{"category_code":"DSA","level":5},{"category_code":"SQL","level":3}]}
 assert score_talent_check(hi,"Co",REQ)["readiness_score"]>score_talent_check(lo,"Co",REQ)["readiness_score"]
def test_unknown_is_not_zero():
 r=score_talent_check({"skills":[{"category_code":"COD","level":8}]},"Co",REQ)
 assert r["readiness_score"]==100 and r["coverage_percent"]==44
 assert next(x for x in r["skillset_gap"] if x["category_code"]=="DSA")["status"]=="unknown"
def test_no_assessed_levels_score_null():
 r=score_talent_check({"skills":[]},"Co",REQ); assert r["readiness_score"] is None and r["coverage_percent"]==0
@pytest.mark.parametrize("skill",[{"category_code":"BAD","level":2},{"category_code":"COD","level":11}])
def test_invalid_candidate_data(skill):
 with pytest.raises(TalentCheckValidationError): score_talent_check({"skills":[skill]},"Co",REQ)
def test_bad_dataset(tmp_path):
 p=tmp_path/"c.json"; p.write_text(json.dumps({"companies":{"Co":[{"category_code":"BAD","required_level":2}]}}))
 with pytest.raises(CompanyDatasetError): load_company_dataset(p)
def test_dataset_lookup(tmp_path):
 p=tmp_path/"c.json"; p.write_text(json.dumps({"companies":{"Co":REQ}}))
 assert run_talent_check({"skills":[]},"Co",p)["company"]=="Co"
 with pytest.raises(CompanyNotFoundError): run_talent_check({"skills":[]},"Other",p)
