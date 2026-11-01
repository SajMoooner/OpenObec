# Recorded controller decisions

Ruling: reuse current checkout on codex/openobec-demo rather than create a new worktree — desktop instructions prefer reuse and user research stays untouched — cost if wrong: implementation shares this checkout but is isolated from main by branch.

Ruling: execute the saved implementation plan without an additional plan-review stop — user explicitly said start implementation after approving the full design — cost if wrong: reversible implementation choices remain reviewable in the branch.

Ruling: bootstrap initial demo read generation through current-offset capture plus authoritative exports before seed — safer alternative to auto-review-rejected synthetic cleanup tombstones; shared Kafka history is preserved — cost if wrong: incomplete projection, caught by rebuild/seed acceptance tests. Historical task-only offsets0:19,1:16,2:20; normal demo DBs empty. Future tests use isolated topics.

Ruling: fixed shared-stack Kafka topic/DLQ/group names in Compose and removed advanced overrides from.env.example — contracts declare onefixedstream, a newgroup without a rebuild could replay historicalfixtures; standalone service env knobs remain for isolatedtests — cost if wrong: operators needing custom sharedtopics must deliberately extend orchestration.

Ruling: honorlatestexplicitcenteredwidth/morecontentinstructionascurrentordinaryrefinementauthority;preserveoldcomp'sfailed63%responsivegateOPEN andrecordcurrentsource/capturehashesseparately, nofakepass/noarchival/configmigration — neweruserinstructionoverridesskillgeometryguidelineandreviewcontractacceptsquoteduserdowngrade;engineEnglishreasonrejectedSlovakquotation — costifwrong: oldexactcompgeometryisnotcertifiedfornewpage,butcurrentnewbriefvisual/code/behaviorchecksremainreviewable.
