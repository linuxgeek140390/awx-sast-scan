# Generated by Django 2.2.4 on 2019-09-12 14:49

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0091_v360_approval_node_notifications'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobtemplate',
            name='webhook_credential',
            field=models.ForeignKey(
                blank=True,
                help_text='Personal Access Token for posting back the status to the service API',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='jobtemplates',
                to='main.Credential',
            ),
        ),
        migrations.AddField(
            model_name='jobtemplate',
            name='webhook_key',
            field=models.CharField(blank=True, help_text='Shared secret that the webhook service will use to sign requests', max_length=64),
        ),
        migrations.AddField(
            model_name='jobtemplate',
            name='webhook_service',
            field=models.CharField(
                blank=True, choices=[('github', 'GitHub'), ('gitlab', 'GitLab')], help_text='Service that webhook requests will be accepted from', max_length=16
            ),
        ),
        migrations.AddField(
            model_name='workflowjobtemplate',
            name='webhook_credential',
            field=models.ForeignKey(
                blank=True,
                help_text='Personal Access Token for posting back the status to the service API',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='workflowjobtemplates',
                to='main.Credential',
            ),
        ),
        migrations.AddField(
            model_name='workflowjobtemplate',
            name='webhook_key',
            field=models.CharField(blank=True, help_text='Shared secret that the webhook service will use to sign requests', max_length=64),
        ),
        migrations.AddField(
            model_name='workflowjobtemplate',
            name='webhook_service',
            field=models.CharField(
                blank=True, choices=[('github', 'GitHub'), ('gitlab', 'GitLab')], help_text='Service that webhook requests will be accepted from', max_length=16
            ),
        ),
        migrations.AlterField(
            model_name='unifiedjob',
            name='launch_type',
            field=models.CharField(
                choices=[
                    ('manual', 'Manual'),
                    ('relaunch', 'Relaunch'),
                    ('callback', 'Callback'),
                    ('scheduled', 'Scheduled'),
                    ('dependency', 'Dependency'),
                    ('workflow', 'Workflow'),
                    ('webhook', 'Webhook'),
                    ('sync', 'Sync'),
                    ('scm', 'SCM Update'),
                ],
                db_index=True,
                default='manual',
                editable=False,
                max_length=20,
            ),
        ),
    ]
